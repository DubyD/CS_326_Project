import * as conversionService from "../services/conversionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createConversion = asyncHandler(async (req, res) => {
  const { language, sourceCode } = req.body ?? {};

  if (!sourceCode || !sourceCode.trim()) {
    return res.status(400).json({ message: "Please enter code to convert." });
  }

  const convertedCode = await conversionService.convert({
    language,
    sourceCode,
  });

  res.status(201).json({ convertedCode });
});