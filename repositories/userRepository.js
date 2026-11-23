import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

// no password field on purpose: the plain password is never stored
export const findByUsername = async (username) =>
  User.findOne({ username: username });

export const findById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return (await User.findById(id)) ?? null;
};

// signup always lands on the schema default role, never a role from the form
export const create = async ({ username, passwordHash }) =>
  User.create({ username, passwordHash });

export const makeAdmin = async ({ username, passwordHash }) => {
  const user = await User.findOne({ username });
  if (user) {
    user.passwordHash = passwordHash;
    user.role = "admin";
    await user.save();
    return user;
  }
  return User.create({ username, passwordHash, role: "admin" });
};
