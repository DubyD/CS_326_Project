import * as conversionService from "../services/conversionService.js";
import * as conversionRepository from "../repositories/conversionRepository.js";
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

// List every saved conversion (newest first).
export const listConversions = asyncHandler(async (req, res) => {
  const conversions = await conversionRepository.getAll();
  res.json(conversions);
});

// View by id
export const getConversion = asyncHandler(async (req, res) => {
  const conversion = await conversionRepository.findById(req.params.id);
  if (!conversion) return res.status(404).json({ message: "no conversions" });
  res.json(conversion);
});

// Edit by id
export const updateConversion = asyncHandler(async (req, res) => {
  const { language, sourceCode, convertedCode } = req.body ?? {};
  const fields = {};
  if (language !== undefined) fields.language = language;
  if (sourceCode !== undefined) fields.sourceCode = sourceCode;
  if (convertedCode !== undefined) fields.convertedCode = convertedCode;

  const conversion = await conversionRepository.updateById(req.params.id, fields);
  if (!conversion) return res.status(404).json({ message: "no conversions" });
  res.json(conversion);
});

// Delete by id
export const deleteConversion = asyncHandler(async (req, res) => {
  const conversion = await conversionRepository.removeById(req.params.id);
  if (!conversion) return res.status(404).json({ message: "no conversions" });
  res.status(204).end();
});
