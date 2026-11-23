import { jest } from "@jest/globals";
import { homePage, aboutPage } from "../controllers/pageController.js";

test("homePage renders index", () => {
  const res = { render: jest.fn() };
  homePage({}, res);
  expect(res.render).toHaveBeenCalledWith("index");
});

test("aboutPage renders about with title and body", () => {
  const res = { render: jest.fn() };
  aboutPage({}, res);
  expect(res.render).toHaveBeenCalledWith(
    "about",
    expect.objectContaining({ title: "About", body: expect.any(String) }),
  );
});
