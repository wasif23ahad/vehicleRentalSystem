import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { loginUser, registerUser } from "./auth.service";

export const signup = asyncHandler(async (req: Request, res: Response) => {
	const user = await registerUser(req.body);
	sendSuccess(res, 201, "User registered successfully", user);
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
	const data = await loginUser(req.body);
	sendSuccess(res, 200, "Login successful", data);
});
