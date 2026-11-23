import * as conversionService from "../services/conversionService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createConversion = asyncHandler(async (req, res) => {
  const { language, sourceCode } = req.body ?? {};

  if (!sourceCode || !sourceCode.trim()) {
    return res.status(400).json({ message: "Please enter code to convert." });
  }

  // owner comes from the session, never from the request body
  const convertedCode = await conversionService.convert({
    language,
    sourceCode,
    owner: req.user._id,
  });

  res.status(201).json({ convertedCode });
});

// List saved conversions (newest first), admins see all of them.
export const listConversions = asyncHandler(async (req, res) => {
  res.json(await conversionService.list(req.user));
});

// View by id
export const getConversion = asyncHandler(async (req, res) => {
  const conversion = await conversionService.getOne(req.params.id, req.user);
  res.json(conversion);
});

// Edit by id
export const updateConversion = asyncHandler(async (req, res) => {
  const { language, sourceCode, convertedCode } = req.body ?? {};
  const fields = {};
  if (language !== undefined) fields.language = language;
  if (sourceCode !== undefined) fields.sourceCode = sourceCode;
  if (convertedCode !== undefined) fields.convertedCode = convertedCode;

  const conversion = await conversionService.update(
    req.params.id,
    fields,
    req.user
  );
  if (!conversion) return res.status(404).json({ message: "no conversions" });
  res.json(conversion);
});

// Delete by id
export const deleteConversion = asyncHandler(async (req, res) => {
  const conversion = await conversionService.remove(req.params.id, req.user);
  if (!conversion) return res.status(404).json({ message: "no conversions" });
  res.status(204).end();
});
