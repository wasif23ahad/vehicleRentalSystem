import { query } from "../../config/db";
import { AppError } from "../../utils/appError";
import { ensure, isValidRole } from "../../utils/validation";
import { User, UserRole } from "../../types/entities";

export const getAllUsers = async () => {
	const result = await query(
		"SELECT id, name, email, phone, role FROM users ORDER BY id"
	);
	return result.rows as User[];
};

interface UpdatePayload {
	name?: string;
	email?: string;
	phone?: string;
	role?: string;
}

export const updateUser = async (
	userId: number,
	payload: UpdatePayload,
	actor: { id: number; role: UserRole }
) => {
	if (actor.role !== "admin" && actor.id !== userId) {
		throw new AppError("Forbidden", 403);
	}

	const updates: Record<string, unknown> = {};
	if (payload.name?.trim()) updates.name = payload.name.trim();
	if (payload.email?.trim()) updates.email = payload.email.trim().toLowerCase();
	if (payload.phone?.trim()) updates.phone = payload.phone.trim();
	if (payload.role && actor.role === "admin") {
		ensure(isValidRole(payload.role), "Invalid role");
		updates.role = payload.role;
	}

	const keys = Object.keys(updates);
	ensure(keys.length > 0, "No fields to update");

	const setClause = keys
		.map((key, index) => `${key} = $${index + 1}`)
		.join(", ");
	const values = keys.map((key) => updates[key]);

	const result = await query(
		`UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}
		 RETURNING id, name, email, phone, role`,
		[...values, userId]
	);

	if (result.rows.length === 0) {
		throw new AppError("User not found", 404);
	}

	return result.rows[0] as User;
};

export const deleteUser = async (userId: number) => {
	const activeBookings = await query(
		"SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active' LIMIT 1",
		[userId]
	);

	if (activeBookings.rows.length > 0) {
		throw new AppError("User has active bookings", 400);
	}

	const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [
		userId,
	]);

	if (result.rows.length === 0) {
		throw new AppError("User not found", 404);
	}
};
