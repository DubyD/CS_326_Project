import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/userRepository.js", () => ({
  findById: jest.fn(),
}));
jest.unstable_mockModule("../services/conversionService.js", () => ({
  convert: jest.fn(),
}));
jest.unstable_mockModule("../repositories/conversionRepository.js", () => ({
  getAll: jest.fn(),
}));

const { default: express } = await import("express");
const { default: request } = await import("supertest");
const { default: router } = await import("../routes/conversionRoutes.js");

const app = express();
app.use(express.json());
app.use("/conversions", router);

test.each([
  ["get", "/conversions"],
  ["post", "/conversions"],
  ["get", "/conversions/abc"],
  ["patch", "/conversions/abc"],
  ["delete", "/conversions/abc"],
])("%s %s is 401 when logged out", async (method, url) => {
  const res = await request(app)[method](url).expect(401);
  expect(res.body).toEqual({ message: "log in first." });
});
