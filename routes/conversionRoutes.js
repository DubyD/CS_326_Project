import { Router } from "express";
import {
  createConversion,
  listConversions,
  getConversion,
  updateConversion,
  deleteConversion,
} from "../controllers/conversionController.js";
import { requireApi } from "../middleware/auth.js";

const router = Router();

// every conversion route needs a logged in user
router.post("/", requireApi, createConversion);
router.get("/", requireApi, listConversions);
router.get("/:id", requireApi, getConversion);
router.patch("/:id", requireApi, updateConversion);
router.delete("/:id", requireApi, deleteConversion);

export default router;
