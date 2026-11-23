import { Router } from "express";
import {
  loginPage,
  signupPage,
  login,
  signup,
  logout,
  whoami,
} from "../controllers/authController.js";
import { requireApi } from "../middleware/auth.js";

const router = Router();

router.get("/login", loginPage);
router.get("/signup", signupPage);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// get on logout too so the browser can end the session by typing the url
router.get("/logout", logout);
router.get("/me", requireApi, whoami);

export default router;
