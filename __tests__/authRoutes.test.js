import { jest } from "@jest/globals";

const service = {
  convert: jest.fn(),
  list: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
jest.unstable_mockModule("../services/conversionService.js", () => service);

// pretend a logged-in member is making every request
const user = { _id: "u1", role: "member" };
jest.unstable_mockModule("../middleware/auth.js", () => ({
  requireApi: (req, res, next) => {
    req.user = user;
    next();
  },
  requireLogin: (req, res, next) => {
    req.user = user;
    next();
  },
}));

const { default: express } = await import("express");
const { default: request } = await import("supertest");
const { default: router } = await import("../routes/conversionRoutes.js");

const app = express();
app.use(express.json());
app.use("/conversions", router);
// quiet JSON error handler so failures don't spam the console
app.use((err, req, res, next) =>
  res.status(err.status || 500).json({ message: err.message }),
);

beforeEach(() => jest.resetAllMocks());

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
  expect(service.convert).toHaveBeenCalledWith(
    expect.objectContaining({ owner: "u1" }),
  );
});

test("GET / lists", async () => {
  service.list.mockResolvedValue([{ a: 1 }]);
  const res = await request(app).get("/conversions").expect(200);
  expect(res.body).toEqual([{ a: 1 }]);
});

test("GET /:id 404 when missing", async () => {
  service.getOne.mockRejectedValue(
    Object.assign(new Error("no conversions"), { status: 404 }),
  );
  await request(app).get("/conversions/abc").expect(404);
});

test("GET /:id 403 for someone else's record", async () => {
  service.getOne.mockRejectedValue(
    Object.assign(new Error("not your conversion."), { status: 403 }),
  );
  const res = await request(app).get("/conversions/abc").expect(403);
  expect(res.body.message).toBe("not your conversion.");
});

test("PATCH /:id updates", async () => {
  service.update.mockResolvedValue({ language: "c" });
  await request(app)
    .patch("/conversions/abc")
    .send({ language: "c" })
    .expect(200);
});

test("DELETE /:id 204", async () => {
  service.remove.mockResolvedValue({});
  await request(app).delete("/conversions/abc").expect(204);
});

test("service error becomes 500", async () => {
  service.convert.mockRejectedValue(new Error("boom"));
  await request(app).post("/conversions").send({ sourceCode: "x" }).expect(500);
});
