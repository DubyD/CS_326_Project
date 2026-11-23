import { Router } from "express";
import { homePage, aboutPage } from "../controllers/pageController.js";
import { requireLogin } from "../middleware/auth.js";

const router = Router();

// logged out you end up at /login, the converter is not for you yet
router.get("/", requireLogin, homePage);
router.get("/about", requireLogin, aboutPage);

export default router;
