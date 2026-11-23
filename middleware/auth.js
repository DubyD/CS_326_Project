import * as userRepository from "../repositories/userRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const load = async (req) => {
  if (!req.session?.userId) return null;
  const user = await userRepository.findById(req.session.userId);
  if (!user && req.session?.userId) req.session.destroy(() => {});
  return user;
};

// pages: logged out goes to the login page
export const requireLogin = asyncHandler(async (req, res, next) => {
  const user = await load(req);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
});

// json: logged out gets a 401 and the route never runs
export const requireApi = asyncHandler(async (req, res, next) => {
  const user = await load(req);
  if (!user) return res.status(401).json({ message: "log in first." });
  req.user = user;
  next();
});
