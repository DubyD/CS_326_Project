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
jest.unstable_mockModule("../middleware/auth.js", () => ({
  requireApi: (req, res, next) => next(),
  requireLogin: (req, res, next) => next(),
}));

const { default: express } = await import("express");
const { default: request } = await import("supertest");
const { default: router } = await import("../routes/conversionRoutes.js");

const app = express();
app.use(express.json());
app.use("/conversions", router);

beforeEach(() => jest.clearAllMocks());

test("POST / returns 400 without code", async () => {
  await request(app).post("/conversions").send({}).expect(400);
});

test("POST / returns 201", async () => {
  service.convert.mockResolvedValue("out");
  const res = await request(app)
    .post("/conversions")
    .send({ sourceCode: "x" })
    .expect(201);
  expect(res.body).toEqual({ convertedCode: "out" });
});

test("GET / lists", async () => {
  repo.getAll.mockResolvedValue([{ a: 1 }]);
  const res = await request(app).get("/conversions").expect(200);
  expect(res.body).toEqual([{ a: 1 }]);
});

test("GET /:id 404", async () => {
  repo.findById.mockResolvedValue(null);
  await request(app).get("/conversions/abc").expect(404);
});

test("PATCH /:id updates", async () => {
  repo.updateById.mockResolvedValue({ language: "c" });
  await request(app)
    .patch("/conversions/abc")
    .send({ language: "c" })
    .expect(200);
});

test("DELETE /:id 204", async () => {
  repo.removeById.mockResolvedValue({});
  await request(app).delete("/conversions/abc").expect(204);
});

test("service error becomes 500", async () => {
  service.convert.mockRejectedValue(new Error("boom"));
  await request(app).post("/conversions").send({ sourceCode: "x" }).expect(500);
});
