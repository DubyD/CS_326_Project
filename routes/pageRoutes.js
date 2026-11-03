import { Router } from "express";
import { homePage, aboutPage } from "../controllers/pageController.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
export default router;
