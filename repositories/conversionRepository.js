
import mongoose from "mongoose";

const conversionSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    convertedCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Conversion = mongoose.model("Conversion", conversionSchema);

export const getAll = async () =>
  Conversion.find().sort({ createdAt: -1 });

// Find record by ID
export const findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return (await Conversion.findById(id)) ?? null;
};

// Insert one record
export const create = async ({ language, sourceCode, convertedCode }) =>
  Conversion.create({ language, sourceCode, convertedCode });

// Update a record by ID
export const updateById = async (id, fields) => {
  if (!mongoose.isValidObjectId(id)) return null;

  return Conversion.findByIdAndUpdate(id, fields, {
    returnDocument: "after",
    runValidators: true,
  });
};

// Delete a record by ID
export const removeById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;

  return Conversion.findByIdAndDelete(id);
};
