import { Router } from "express";
import {
  homePage,
  aboutPage,
  historyPage,
  conversionPage,
} from "../controllers/pageController.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);

export default router;
