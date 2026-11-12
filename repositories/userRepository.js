
import { User } from "../models/User.js";

// Find a user by email
export const findByEmail = async (email) => {
  return User.findOne({ email: email.trim().toLowerCase() });
};

// Find a user by ID
export const findById = async (id) => {
  return User.findById(id);
};

// Create a new user
export const create = async ({ username, email, passwordHash }) => {
  return User.create({
    username,
    email,
    passwordHash
  });
};
