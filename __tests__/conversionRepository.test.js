import { jest } from "@jest/globals";

const Model = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};
const isValidObjectId = jest.fn();
jest.unstable_mockModule("mongoose", () => {
  function Schema() {}
  const m = { Schema, model: jest.fn(() => Model), isValidObjectId };
  return { default: m, ...m };
});

const repo = await import("../repositories/conversionRepository.js");
beforeEach(() => jest.clearAllMocks());

test("getAll sorts newest first", async () => {
  const sort = jest.fn().mockResolvedValue([1]);
  Model.find.mockReturnValue({ sort });
  await expect(repo.getAll()).resolves.toEqual([1]);
  expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
});

test("findById returns null for invalid id", async () => {
  isValidObjectId.mockReturnValue(false);
  await expect(repo.findById("bad")).resolves.toBeNull();
  expect(Model.findById).not.toHaveBeenCalled();
});

test("findById returns doc or null", async () => {
  isValidObjectId.mockReturnValue(true);
  Model.findById
    .mockResolvedValueOnce({ id: 1 })
    .mockResolvedValueOnce(undefined);
  await expect(repo.findById("ok")).resolves.toEqual({ id: 1 });
  await expect(repo.findById("ok")).resolves.toBeNull();
});

test("create passes only known fields", async () => {
  await repo.create({
    language: "c",
    sourceCode: "s",
    convertedCode: "o",
    extra: 1,
  });
  expect(Model.create).toHaveBeenCalledWith({
    language: "c",
    sourceCode: "s",
    convertedCode: "o",
  });
});

test("updateById uses new + validators", async () => {
  await repo.updateById("id", { language: "c" });
  expect(Model.findByIdAndUpdate).toHaveBeenCalledWith(
    "id",
    { language: "c" },
    { new: true, runValidators: true },
  );
});

test("removeById deletes", async () => {
  await repo.removeById("id");
  expect(Model.findByIdAndDelete).toHaveBeenCalledWith("id");
});
