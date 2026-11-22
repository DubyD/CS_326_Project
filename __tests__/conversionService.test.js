import { jest } from "@jest/globals";

const execFile = jest.fn();
const fs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdtemp: jest.fn(),
  rm: jest.fn(),
};
const repo = { create: jest.fn() };
jest.unstable_mockModule("node:child_process", () => ({ execFile }));
jest.unstable_mockModule("node:fs/promises", () => fs);
jest.unstable_mockModule("../repositories/conversionRepository.js", () => repo);

const { convert } = await import("../services/conversionService.js");

beforeEach(() => {
  jest.clearAllMocks();
  fs.mkdtemp.mockResolvedValue("/tmp/conv-1");
  fs.writeFile.mockResolvedValue();
  fs.rm.mockResolvedValue();
  fs.readFile.mockResolvedValue("decompiled");
  execFile.mockImplementation((file, args, opts, cb) => cb(null, "", ""));
});

test("rejects unsupported language without touching fs", async () => {
  await expect(convert({ language: "rust", sourceCode: "x" })).rejects.toThrow(
    "Unsupported language: rust",
  );
  expect(fs.mkdtemp).not.toHaveBeenCalled();
});

test("converts, saves, returns code, cleans up", async () => {
  await expect(convert({ language: "C", sourceCode: "src" })).resolves.toBe(
    "decompiled",
  );
  expect(fs.writeFile).toHaveBeenCalledWith(
    expect.stringContaining("input.c"),
    "src",
    "utf8",
  );
  const [, args] = execFile.mock.calls[0];
  expect(args[0]).toMatch(/converter\.py$/);
  expect(args.slice(1)).toEqual([
    expect.stringContaining("input.c"),
    expect.stringContaining("output.c"),
  ]);
  expect(repo.create).toHaveBeenCalledWith({
    language: "c",
    sourceCode: "src",
    convertedCode: "decompiled",
  });
  expect(fs.rm).toHaveBeenCalledWith("/tmp/conv-1", {
    recursive: true,
    force: true,
  });
});

test("defaults language to c", async () => {
  await convert({ sourceCode: "src" });
  expect(repo.create).toHaveBeenCalledWith(
    expect.objectContaining({ language: "c" }),
  );
});

test("surfaces stderr on failure and still cleans up", async () => {
  execFile.mockImplementation((f, a, o, cb) =>
    cb(Object.assign(new Error("x"), { stderr: " gcc error \n" })),
  );
  await expect(convert({ sourceCode: "src" })).rejects.toThrow("gcc error");
  expect(repo.create).not.toHaveBeenCalled();
  expect(fs.rm).toHaveBeenCalled();
});

test("reports timeout", async () => {
  execFile.mockImplementation((f, a, o, cb) =>
    cb(Object.assign(new Error("x"), { killed: true })),
  );
  await expect(convert({ sourceCode: "src" })).rejects.toThrow(
    "Conversion timed out.",
  );
});

test("rejects empty decompiler output", async () => {
  fs.readFile.mockResolvedValue("  \n");
  await expect(convert({ sourceCode: "src" })).rejects.toThrow(
    "Decompiler produced no output.",
  );
  expect(repo.create).not.toHaveBeenCalled();
});
