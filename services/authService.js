import bcrypt from "bcrypt";
import * as userRepository from "../repositories/userRepository.js";
import { HttpError } from "../utils/httpError.js";

const ROUNDS = 10;

export const signup = async ({ username, password }) => {
  const taken = await userRepository.findByUsername(username);
  if (taken) throw new HttpError(409, "that username is taken.");

  const passwordHash = await bcrypt.hash(password, ROUNDS);
  return userRepository.create({ username, passwordHash });
};

export const login = async ({ username, password }) => {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new HttpError(401, "wrong username or password.");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "wrong username or password.");

  return user;
};
