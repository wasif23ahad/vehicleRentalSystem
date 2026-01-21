import { Request } from "express";
import { AppError } from "./appError";

export const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  return req.user;
};
