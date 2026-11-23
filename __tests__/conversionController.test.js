import { jest } from "@jest/globals";

const service = {
  convert: jest.fn(),
  list: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
jest.unstable_mockModule("../services/conversionService.js", () => service);

const c = await import("../controllers/conversionController.js");

const user = { _id: "u1", role: "member" };
const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

describe("createConversion", () => {
  test.each([undefined, {}, { sourceCode: "   " }])(
    "400 on missing code (%p)",
    async (body) => {
      const res = mockRes();
      await c.createConversion({ body, user }, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
      expect(service.convert).not.toHaveBeenCalled();
    },
  );

  test("201, owner comes from the session", async () => {
    service.convert.mockResolvedValue("int main(){}");
    const res = mockRes();
    await c.createConversion(
      { body: { language: "c", sourceCode: "x", owner: "hacker" }, user },
      res,
      jest.fn(),
    );
    expect(service.convert).toHaveBeenCalledWith({
      language: "c",
      sourceCode: "x",
      owner: "u1",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ convertedCode: "int main(){}" });
  });

  test("passes service errors to next", async () => {
    const err = new Error("fail");
    service.convert.mockRejectedValue(err);
    const next = jest.fn();
    await c.createConversion(
      { body: { sourceCode: "x" }, user },
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalledWith(err);
  });
});

test("listConversions passes the user to the service", async () => {
  service.list.mockResolvedValue([{ id: 1 }]);
  const res = mockRes();
  await c.listConversions({ user }, res, jest.fn());
  expect(service.list).toHaveBeenCalledWith(user);
  expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
});

describe("getConversion", () => {
  test("returns the record", async () => {
    service.getOne.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.getConversion({ params: { id: "a" }, user }, res, jest.fn());
    expect(service.getOne).toHaveBeenCalledWith("a", user);
    expect(res.json).toHaveBeenCalledWith({ id: "a" });
  });

  test("403 from the service becomes a JSON response", async () => {
    const err = Object.assign(new Error("not your conversion."), {
      status: 403,
    });
    service.getOne.mockRejectedValue(err);
    const res = mockRes();
    const next = jest.fn();
    await c.getConversion({ params: { id: "a" }, user }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "not your conversion." });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("updateConversion", () => {
  test("only sends defined fields", async () => {
    service.update.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.updateConversion(
      {
        params: { id: "a" },
        body: { language: "c", sourceCode: undefined },
        user,
      },
      res,
      jest.fn(),
    );
    expect(service.update).toHaveBeenCalledWith("a", { language: "c" }, user);
    expect(res.json).toHaveBeenCalledWith({ id: "a" });
  });

  test("404 when the service returns nothing", async () => {
    service.update.mockResolvedValue(null);
    const res = mockRes();
    await c.updateConversion(
      { params: { id: "a" }, body: {}, user },
      res,
      jest.fn(),
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("deleteConversion", () => {
  test("204 on success", async () => {
    service.remove.mockResolvedValue({ id: "a" });
    const res = mockRes();
    await c.deleteConversion({ params: { id: "a" }, user }, res, jest.fn());
    expect(service.remove).toHaveBeenCalledWith("a", user);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  test("404 when the service returns nothing", async () => {
    service.remove.mockResolvedValue(null);
    const res = mockRes();
    await c.deleteConversion({ params: { id: "a" }, user }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
