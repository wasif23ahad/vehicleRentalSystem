import { query } from "../../config/db";
import { AppError } from "../../utils/appError";
import { ensure, isValidVehicleStatus, isValidVehicleType } from "../../utils/validation";
import { Vehicle } from "../../types/entities";

interface CreateVehiclePayload {
	vehicle_name: string;
	type: string;
	registration_number: string;
	daily_rent_price: number;
	availability_status: string;
}

interface UpdateVehiclePayload {
	vehicle_name?: string;
	type?: string;
	registration_number?: string;
	daily_rent_price?: number;
	availability_status?: string;
}

export const createVehicle = async (payload: CreateVehiclePayload) => {
	const vehicleName = payload.vehicle_name?.trim();
	const type = payload.type;
	const registrationNumber = payload.registration_number?.trim();
	const dailyRentPrice = payload.daily_rent_price;
	const availabilityStatus = payload.availability_status;

	ensure(!!vehicleName, "Vehicle name is required");
	ensure(!!registrationNumber, "Registration number is required");
	ensure(isValidVehicleType(type), "Invalid vehicle type");
	ensure(
		typeof dailyRentPrice === "number" && dailyRentPrice > 0,
		"Daily rent price must be a positive number"
	);
	ensure(isValidVehicleStatus(availabilityStatus), "Invalid availability status");

	const result = await query(
		`INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
		[vehicleName, type, registrationNumber, dailyRentPrice, availabilityStatus]
	);

	return result.rows[0] as Vehicle;
};

export const getAllVehicles = async () => {
	const result = await query(
		"SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id"
	);
	return result.rows as Vehicle[];
};

export const getVehicleById = async (vehicleId: number) => {
	const result = await query(
		"SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
		[vehicleId]
	);

	if (result.rows.length === 0) {
		throw new AppError("Vehicle not found", 404);
	}

	return result.rows[0] as Vehicle;
};

export const updateVehicle = async (
	vehicleId: number,
	payload: UpdateVehiclePayload
) => {
	const updates: Record<string, unknown> = {};

	if (payload.vehicle_name?.trim()) updates.vehicle_name = payload.vehicle_name.trim();
	if (payload.registration_number?.trim())
		updates.registration_number = payload.registration_number.trim();
	if (payload.type) {
		ensure(isValidVehicleType(payload.type), "Invalid vehicle type");
		updates.type = payload.type;
	}
	if (payload.availability_status) {
		ensure(
			isValidVehicleStatus(payload.availability_status),
			"Invalid availability status"
		);
		updates.availability_status = payload.availability_status;
	}
	if (payload.daily_rent_price !== undefined) {
		ensure(
			typeof payload.daily_rent_price === "number" && payload.daily_rent_price > 0,
			"Daily rent price must be a positive number"
		);
		updates.daily_rent_price = payload.daily_rent_price;
	}

	const keys = Object.keys(updates);
	ensure(keys.length > 0, "No fields to update");

	const setClause = keys
		.map((key, index) => `${key} = $${index + 1}`)
		.join(", ");
	const values = keys.map((key) => updates[key]);

	const result = await query(
		`UPDATE vehicles SET ${setClause} WHERE id = $${keys.length + 1}
		 RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
		[...values, vehicleId]
	);

	if (result.rows.length === 0) {
		throw new AppError("Vehicle not found", 404);
	}

	return result.rows[0] as Vehicle;
};

export const deleteVehicle = async (vehicleId: number) => {
	const activeBookings = await query(
		"SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1",
		[vehicleId]
	);

	if (activeBookings.rows.length > 0) {
		throw new AppError("Vehicle has active bookings", 400);
	}

	const result = await query("DELETE FROM vehicles WHERE id = $1 RETURNING id", [
		vehicleId,
	]);

	if (result.rows.length === 0) {
		throw new AppError("Vehicle not found", 404);
	}
};
