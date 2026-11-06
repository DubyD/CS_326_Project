import "dotenv/config";
import mongoose from "mongoose";
const MONGO_URI =process.env.MONGO_URI || "mongodb://dev:devpassword@mongo:27017";

export const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
};
