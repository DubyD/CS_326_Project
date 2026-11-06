import { Router } from "express";
import {
  createConversion,
  listConversions,
  getConversion,
  updateConversion,
  deleteConversion,
} from "../controllers/conversionController.js";

const router = Router();

router.post("/", createConversion);
router.get("/", listConversions);
router.get("/:id", getConversion);
router.patch("/:id", updateConversion);
router.delete("/:id", deleteConversion);

export default router;
