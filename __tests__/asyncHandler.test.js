import { jest } from "@jest/globals";
import { asyncHandler } from "../utils/asyncHandler.js";

test("forwards rejected errors to next", async () => {
  const err = new Error("boom");
  const next = jest.fn();
  await asyncHandler(async () => {
    throw err;
  })({}, {}, next);
  expect(next).toHaveBeenCalledWith(err);
});

test("does not call next on success", async () => {
  const next = jest.fn();
  await asyncHandler(async () => "ok")({}, {}, next);
  expect(next).not.toHaveBeenCalled();
});
