import * as conversionService from "../services/conversionService.js";

export const createConversion = async (req, res) => {
  const { language, sourceCode } = req.body ?? {};

  if (!sourceCode || !sourceCode.trim()) {
    return res.status(400).json({ message: "Please enter code to convert." });
  }

  try {
    const convertedCode = await conversionService.convert({
      language,
      sourceCode,
    });
    res.status(201).json({ convertedCode });
  } catch (error) {
    res.status(500).json({ message: error.message || "Conversion failed." });
  }
};
