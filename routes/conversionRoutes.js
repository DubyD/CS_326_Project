import { Router } from "express";
import { createConversion } from "../controllers/conversionController.js";

const router = Router();

router.post("/", createConversion);

export default router;
