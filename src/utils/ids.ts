import { AppError } from "./appError";

export const parseId = (value: string, message = "Invalid id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(message, 400);
  }
  return id;
};
