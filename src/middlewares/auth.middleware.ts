import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { getBearerToken } from "../utils/headers";
import { isValidRole } from "../utils/validation";
import { UserRole } from "../types/entities";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized", errors: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token) as { id: number; role: string };

    if (!isValidRole(decoded.role)) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized", errors: "Invalid role" });
    }

    req.user = { id: decoded.id, role: decoded.role as UserRole };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized", errors: "Unauthorized" });
  }
};
