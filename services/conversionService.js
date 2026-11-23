import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as conversionRepository from "../repositories/conversionRepository.js";
import { HttpError } from "../utils/httpError.js";

const execFileAsync = promisify(execFile);

const PYTHON = process.env.PYTHON_BIN || "python3";
const CONVERTER = path.resolve("backend", "converter.py");

// Only C for now: converter.py compiles with gcc, so the input must be C.
const SUPPORTED = ["c"];

// Ghidra headless analysis is slow — minutes, not seconds.
const TIMEOUT_MS = Number(process.env.CONVERT_TIMEOUT_MS) || 30000000;

export const convert = async ({ language, sourceCode, owner }) => {
  const lang = (language || "c").toLowerCase();
  if (!SUPPORTED.includes(lang)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Per-request temp dir: converter.py's defaults (backend/input.c,
  // backend/output.c) are shared files, so concurrent requests would
  // clobber each other. Passing paths avoids that entirely.
  const dir = await mkdtemp(path.join(tmpdir(), "conv-"));
  const inputPath = path.join(dir, "input.c");
  const outputPath = path.join(dir, "output.c");

  try {
    await writeFile(inputPath, sourceCode, "utf8");

    try {
      // Status messages go to stderr; stdout is the decompiled C.
      await execFileAsync(PYTHON, [CONVERTER, inputPath, outputPath], {
        timeout: TIMEOUT_MS,
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch (err) {
      // Nonzero exit => compile or decompile failed. Surface the reason
      // rather than a generic 500 with no detail.
      const detail = (err.stderr || err.message || "").trim();
      if (err.killed) throw new Error("Conversion timed out.");
      throw new Error(detail || "Conversion failed.");
    }

    // Read the file rather than trusting stdout buffering.
    const convertedCode = await readFile(outputPath, "utf8");
    if (!convertedCode.trim()) {
      throw new Error("Decompiler produced no output.");
    }

    await conversionRepository.create({
      language: lang,
      sourceCode,
      convertedCode,
      owner,
    });
    return convertedCode;
  } finally {
    // Clean up temp input/output regardless of outcome.
    await rm(dir, { recursive: true, force: true });
  }
};

const isOwnerOrAdmin = (record, user) =>
  user.role === "admin" || String(record.owner) === String(user._id);

// load the record first, then check the owner, so nothing gets changed by someone else
const loadOwned = async (id, user) => {
  const record = await conversionRepository.findById(id);
  if (!record) throw new HttpError(404, "no conversions");
  if (!isOwnerOrAdmin(record, user)) throw new HttpError(403, "not your conversion.");
  return record;
};

export const list = async (user) =>
  user.role === "admin"
    ? conversionRepository.getAll()
    : conversionRepository.getMine(user._id);

export const getOne = async (id, user) => loadOwned(id, user);

export const update = async (id, fields, user) => {
  await loadOwned(id, user);
  return conversionRepository.updateById(id, fields);
};

export const remove = async (id, user) => {
  await loadOwned(id, user);
  return conversionRepository.removeById(id);
};
