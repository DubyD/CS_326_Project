import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as conversionRepository from "../repositories/conversionRepository.js";

const execFileAsync = promisify(execFile);

const PYTHON = process.env.PYTHON_BIN || "python3";
const CONVERTER = path.resolve("backend", "converter.py");

// Only C for now: converter.py compiles with gcc, so the input must be C.
const SUPPORTED = ["c"];

// Ghidra headless analysis is slow — minutes, not seconds.
const TIMEOUT_MS = Number(process.env.CONVERT_TIMEOUT_MS) || 300_000;

export const convert = async ({ language, sourceCode }) => {
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

    await conversionRepository.save({
      language: lang,
      sourceCode,
      convertedCode,
    });
    return convertedCode;
  } finally {
    // Clean up temp input/output regardless of outcome.
    await rm(dir, { recursive: true, force: true });
  }
};
