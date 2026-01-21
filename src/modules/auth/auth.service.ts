import { query } from "../../config/db";
import { comparePassword, hashPassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { AppError } from "../../utils/appError";
import { ensure, isValidRole } from "../../utils/validation";
import { User } from "../../types/entities";

interface SignupPayload {
	name: string;
	email: string;
	password: string;
	phone: string;
	role: string;
}

interface SigninPayload {
	email: string;
	password: string;
}

export const registerUser = async (payload: SignupPayload) => {
	const name = payload.name?.trim();
	const email = payload.email?.trim().toLowerCase();
	const password = payload.password;
	const phone = payload.phone?.trim();
	const role = payload.role;

	ensure(!!name, "Name is required");
	ensure(!!email, "Email is required");
	ensure(!!password, "Password is required");
	ensure(password.length >= 6, "Password must be at least 6 characters");
	ensure(!!phone, "Phone is required");
	ensure(!!role && isValidRole(role), "Invalid role");

	const existing = await query("SELECT id FROM users WHERE email = $1", [
		email,
	]);
	if (existing.rows.length > 0) {
		throw new AppError("Email already exists", 400);
	}

	const hashedPassword = await hashPassword(password);
	const result = await query(
		`INSERT INTO users (name, email, password, phone, role)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, email, phone, role`,
		[name, email, hashedPassword, phone, role]
	);

	return result.rows[0] as User;
};

export const loginUser = async (payload: SigninPayload) => {
	const email = payload.email?.trim().toLowerCase();
	const password = payload.password;

	ensure(!!email, "Email is required");
	ensure(!!password, "Password is required");

	const result = await query(
		"SELECT id, name, email, phone, role, password FROM users WHERE email = $1",
		[email]
	);

	if (result.rows.length === 0) {
		throw new AppError("Invalid email or password", 401);
	}

	const user = result.rows[0] as User;
	const isMatch = await comparePassword(password, user.password ?? "");
	if (!isMatch) {
		throw new AppError("Invalid email or password", 401);
	}

	const token = signToken({ id: user.id, role: user.role });

	return {
		token,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
		},
	};
};
