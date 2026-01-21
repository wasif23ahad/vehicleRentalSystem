import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const errorMiddleware = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
			errors: err.errors ?? err.message,
		});
	}

	return res.status(500).json({
		success: false,
		message: "Internal Server Error",
		errors: "Internal Server Error",
	});
};
