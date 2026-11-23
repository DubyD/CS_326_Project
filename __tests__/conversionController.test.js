import { jest } from "@jest/globals";

const service = { convert: jest.fn() };
const repo = {
  getAll: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  removeById: jest.fn(),
};
jest.unstable_mockModule("../services/conversionService.js", () => service);
jest.unstable_mockModule("../repositories/conversionRepository.js", () => repo);

const c = await import("../controllers/conversionController.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);
  return res;
};

beforeEach(() => jest.clearAllMocks());

describe("createConversion", () => {
  test.each([undefined, {}, { sourceCode: "   " }])(
    "400 on missing code (%p)",
    async (body) => {
      const res = mockRes();
      await c.createConversion({ body }, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(service.convert).not.toHaveBeenCalled();
    },
  );

  test("201 with converted code", async () => {
    service.convert.mockResolvedValue("int main(){}");
    const res = mockRes();
    await c.createConversion(
      { body: { language: "c", sourceCode: "x" } },
      res,
      jest.fn(),
    );
    expect(service.convert).toHaveBeenCalledWith({
      language: "c",
      sourceCode: "x",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ convertedCode: "int main(){}" });
  });

  test("passes service errors to next", async () => {
    const err = new Error("fail");
    service.convert.mockRejectedValue(err);
    const next = jest.fn();
    await c.createConversion({ body: { sourceCode: "x" } }, mockRes(), next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

test("listConversions returns all", async () => {
  repo.getAll.mockResolvedValue([{ id: 1 }]);
  const res = mockRes();
  await c.listConversions({}, res, jest.fn());
  expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
});

describe("getConversion", () => {
  test("404 when missing", async () => {
    repo.findById.mockResolvedValue(null);
    const res = mockRes();
    await c.getConversion({ params: { id: "a" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("returns doc", async () => {
    repo.findById.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.getConversion({ params: { id: "a" } }, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ id: "a" });
  });
});

describe("updateConversion", () => {
  test("only sends defined fields", async () => {
    repo.updateById.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.updateConversion(
      { params: { id: "a" }, body: { language: "c", sourceCode: undefined } },
      res,
      jest.fn(),
    );
    expect(repo.updateById).toHaveBeenCalledWith("a", { language: "c" });
    expect(res.json).toHaveBeenCalledWith({ id: "a" });
  });
  test("404 when missing", async () => {
    repo.updateById.mockResolvedValue(null);
    const res = mockRes();
    await c.updateConversion({ params: { id: "a" }, body: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("deleteConversion", () => {
  test("204 on success", async () => {
    repo.removeById.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.deleteConversion({ params: { id: "a" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
  test("404 when missing", async () => {
    repo.removeById.mockResolvedValue(null);
    const res = mockRes();
    await c.deleteConversion({ params: { id: "a" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
