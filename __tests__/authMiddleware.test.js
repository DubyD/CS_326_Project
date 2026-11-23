import { jest } from "@jest/globals";

const repo = { findById: jest.fn() };
jest.unstable_mockModule("../repositories/userRepository.js", () => repo);

const { requireLogin, requireApi } = await import("../middleware/auth.js");

const mockRes = () => {
  const res = { locals: {} };
  res.redirect = jest.fn(() => res);
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

describe("requireLogin", () => {
  test("no session redirects to /login", async () => {
    const res = mockRes();
    const next = jest.fn();
    await requireLogin({ session: {} }, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
    expect(repo.findById).not.toHaveBeenCalled();
  });

  test("valid session attaches the user and continues", async () => {
    const user = { username: "bob" };
    repo.findById.mockResolvedValue(user);
    const req = { session: { userId: "1" } };
    const res = mockRes();
    const next = jest.fn();
    await requireLogin(req, res, next);
    expect(req.user).toBe(user);
    expect(res.locals.user).toBe(user);
    expect(next).toHaveBeenCalled();
  });

  test("session for a deleted user is destroyed and redirected", async () => {
    repo.findById.mockResolvedValue(null);
    const destroy = jest.fn();
    const res = mockRes();
    await requireLogin(
      { session: { userId: "gone", destroy } },
      res,
      jest.fn(),
    );
    expect(destroy).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });
});

describe("requireApi", () => {
  test("no session gets 401 JSON", async () => {
    const res = mockRes();
    const next = jest.fn();
    await requireApi({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "log in first." });
    expect(next).not.toHaveBeenCalled();
  });

  test("valid session continues", async () => {
    repo.findById.mockResolvedValue({ username: "bob" });
    const req = { session: { userId: "1" } };
    const next = jest.fn();
    await requireApi(req, mockRes(), next);
    expect(req.user).toEqual({ username: "bob" });
    expect(next).toHaveBeenCalled();
  });
});
