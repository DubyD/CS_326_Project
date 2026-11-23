import { jest } from "@jest/globals";

const bcrypt = { hash: jest.fn(), compare: jest.fn() };
const repo = { findByUsername: jest.fn(), create: jest.fn() };
jest.unstable_mockModule("bcrypt", () => ({ default: bcrypt, ...bcrypt }));
jest.unstable_mockModule("../repositories/userRepository.js", () => repo);

const { signup, login } = await import("../services/authService.js");

beforeEach(() => jest.resetAllMocks());

describe("signup", () => {
  test("rejects a taken username with 409", async () => {
    repo.findByUsername.mockResolvedValue({ username: "bob" });
    await expect(
      signup({ username: "bob", password: "secret1" }),
    ).rejects.toMatchObject({
      status: 409,
      message: "that username is taken.",
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  test("hashes the password and never stores it in plain text", async () => {
    repo.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("HASH");
    repo.create.mockResolvedValue({ _id: "1", username: "bob" });
    await expect(
      signup({ username: "bob", password: "secret1" }),
    ).resolves.toEqual({ _id: "1", username: "bob" });
    expect(bcrypt.hash).toHaveBeenCalledWith("secret1", 10);
    expect(repo.create).toHaveBeenCalledWith({
      username: "bob",
      passwordHash: "HASH",
    });
  });
});

describe("login", () => {
  test("unknown user gets 401", async () => {
    repo.findByUsername.mockResolvedValue(null);
    await expect(login({ username: "x", password: "y" })).rejects.toMatchObject(
      { status: 401, message: "wrong username or password." },
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test("wrong password gets the same 401 message", async () => {
    repo.findByUsername.mockResolvedValue({ passwordHash: "HASH" });
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      login({ username: "bob", password: "bad" }),
    ).rejects.toMatchObject({
      status: 401,
      message: "wrong username or password.",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith("bad", "HASH");
  });

  test("correct password returns the user", async () => {
    const user = { username: "bob", passwordHash: "HASH" };
    repo.findByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    await expect(login({ username: "bob", password: "secret1" })).resolves.toBe(
      user,
    );
  });
});
