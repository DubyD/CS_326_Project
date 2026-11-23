import { jest } from "@jest/globals";

const repo = {
  create: jest.fn(),
  getAll: jest.fn(),
  getMine: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  removeById: jest.fn(),
};
jest.unstable_mockModule("../repositories/conversionRepository.js", () => repo);

const service = await import("../services/conversionService.js");

const alice = { _id: "a1", role: "member" };
const bob = { _id: "b1", role: "member" };
const admin = { _id: "z1", role: "admin" };
const record = { _id: "r1", owner: "a1" };

beforeEach(() => jest.resetAllMocks());

describe("list", () => {
  test("members only see their own", async () => {
    repo.getMine.mockResolvedValue([record]);
    await expect(service.list(alice)).resolves.toEqual([record]);
    expect(repo.getMine).toHaveBeenCalledWith("a1");
    expect(repo.getAll).not.toHaveBeenCalled();
  });

  test("admins see everything", async () => {
    repo.getAll.mockResolvedValue([record]);
    await service.list(admin);
    expect(repo.getAll).toHaveBeenCalled();
    expect(repo.getMine).not.toHaveBeenCalled();
  });
});

describe.each([
  ["getOne", (u) => service.getOne("r1", u)],
  ["update", (u) => service.update("r1", { language: "c" }, u)],
  ["remove", (u) => service.remove("r1", u)],
])("%s", (name, call) => {
  test("404 when the record does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(call(alice)).rejects.toMatchObject({ status: 404 });
  });

  test("403 for another member's record, nothing changed", async () => {
    repo.findById.mockResolvedValue(record);
    await expect(call(bob)).rejects.toMatchObject({
      status: 403,
      message: "not your conversion.",
    });
    expect(repo.updateById).not.toHaveBeenCalled();
    expect(repo.removeById).not.toHaveBeenCalled();
  });

  test("owner is allowed", async () => {
    repo.findById.mockResolvedValue(record);
    await call(alice); // throws (and fails) if access is denied
  });

  test("admin is allowed on anyone's record", async () => {
    repo.findById.mockResolvedValue(record);
    await call(admin);
    if (name === "update")
      expect(repo.updateById).toHaveBeenCalledWith("r1", { language: "c" });
    if (name === "remove") expect(repo.removeById).toHaveBeenCalledWith("r1");
  });
});

test("owner match works when owner is an ObjectId-like value", async () => {
  repo.findById.mockResolvedValue({ owner: { toString: () => "a1" } });
  await expect(service.getOne("r1", alice)).resolves.toBeDefined();
});
