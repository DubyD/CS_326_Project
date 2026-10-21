import { Routes } from "express";
import { homePage, aboutPage } from "../controllers/pageCOntroller.js";

const router = Router();

router.get("/", homePage);
router.get("/about", aboutPage);
export default router;
