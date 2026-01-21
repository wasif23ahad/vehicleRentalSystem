import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { deleteUser, getAllUsers, updateUser } from "./user.service";
import { parseId } from "../../utils/ids";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
	const users = await getAllUsers();
	sendSuccess(res, 200, "Users retrieved successfully", users);
});

export const updateUserById = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = parseId(req.params.userId as string, "Invalid user id");
		const actor = req.user!;
		const user = await updateUser(userId, req.body, actor);
		sendSuccess(res, 200, "User updated successfully", user);
	}
);

export const deleteUserById = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = parseId(req.params.userId as string, "Invalid user id");
		await deleteUser(userId);
		sendSuccess(res, 200, "User deleted successfully");
	}
);
