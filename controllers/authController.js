import * as authService from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// the two pages, both open to logged out people
export const loginPage = (req, res) => {
  if (req.session?.userId) return res.redirect("/");
  res.render("login", { error: req.query.error });
};

export const signupPage = (req, res) => {
  if (req.session?.userId) return res.redirect("/");
  res.render("signup", { error: req.query.error });
};

export const signup = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};

  // role is never read here, so posting role=admin with the form does nothing
  const bad = (status, message) => {
    if (req.accepts("html")) return res.status(status).render("signup", { error: message });
    return res.status(status).json({ message });
  };

  if (!username || !password) return bad(400, "username and password are both required.");
  if (String(password).length < 6) return bad(400, "password must be at least 6 characters.");

  let user = null;
  try {
    user = await authService.signup({ username, password });
  } catch (err) {
    return bad(err.status || 500, err.message);
  }

  req.session.userId = String(user._id);
  if (!req.accepts("html")) {
    return res.status(201).json({ username: user.username, role: user.role });
  }
  res.redirect("/");
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};

  const bad = (status, message) => {
    if (req.accepts("html")) return res.status(status).render("login", { error: message });
    return res.status(status).json({ message });
  };

  if (!username || !password) return bad(400, "username and password are both required.");

  let user = null;
  try {
    user = await authService.login({ username, password });
  } catch (err) {
    return bad(err.status || 401, err.message);
  }

  req.session.userId = String(user._id);
  if (!req.accepts("html")) {
    return res.json({ username: user.username, role: user.role });
  }
  res.redirect("/");
});

// json, this is what says you are logged in
export const whoami = (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    if (req.accepts("html")) return res.redirect("/login");
    res.json({ message: "logged out." });
  });
};
