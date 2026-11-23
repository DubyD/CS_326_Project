import mongoose from "mongoose";
const conversionSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    convertedCode: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Conversion = mongoose.model("Conversion", conversionSchema);

// admins see everything, everyone else only sees their own
export const getAll = async () => Conversion.find().sort({ createdAt: -1 });

export const getMine = async (userId) =>
  Conversion.find({ owner: userId }).sort({ createdAt: -1 });

// find record by id
export const findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return (await Conversion.findById(id)) ?? null;
};

//insert one record.
export const create = async ({ language, sourceCode, convertedCode, owner }) =>
  Conversion.create({ language, sourceCode, convertedCode, owner });

//replace a record's fields by id
export const updateById = async (id, fields) =>
  Conversion.findByIdAndUpdate(id, fields, { new: true, runValidators: true });

//delete one record by id
export const removeById = async (id) => Conversion.findByIdAndDelete(id);
