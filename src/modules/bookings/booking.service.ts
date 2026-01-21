import { query } from "../../config/db";
import { AppError } from "../../utils/appError";
import { ensure, isValidBookingStatus } from "../../utils/validation";
import { calculateRentalDays } from "../../utils/date.utils";
import { runTransaction } from "../../utils/transaction";
import { Booking, UserRole } from "../../types/entities";

interface CreateBookingPayload {
	customer_id: number;
	vehicle_id: number;
	rent_start_date: string;
	rent_end_date: string;
}

export const autoReturnExpiredBookings = async () => {
	await query(
		`WITH expired AS (
			 UPDATE bookings
			 SET status = 'returned'
			 WHERE status = 'active' AND rent_end_date < CURRENT_DATE
			 RETURNING vehicle_id
		 )
		 UPDATE vehicles
		 SET availability_status = 'available'
		 WHERE id IN (SELECT vehicle_id FROM expired)`
	);
};

export const createBooking = async (payload: CreateBookingPayload) => {
	const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

	ensure(!!customer_id, "Customer id is required");
	ensure(!!vehicle_id, "Vehicle id is required");
	ensure(!!rent_start_date, "Rent start date is required");
	ensure(!!rent_end_date, "Rent end date is required");

	const days = calculateRentalDays(rent_start_date, rent_end_date);
	ensure(days > 0, "Rent end date must be after start date");

	// Check for overlapping bookings
	const existing = await query(
		`SELECT id FROM bookings 
		 WHERE vehicle_id = $1 
		 AND status = 'active'
		 AND (
			(rent_start_date <= $2 AND rent_end_date >= $2) OR
			(rent_start_date <= $3 AND rent_end_date >= $3) OR
			(rent_start_date >= $2 AND rent_end_date <= $3)
		 )`,
		[vehicle_id, rent_end_date, rent_start_date] // Logic: overlap if (start1 <= end2) and (end1 >= start2)
	);
	// Correct overlap logic: (existing_start <= requested_end) AND (existing_end >= requested_start)
	// My SQL above: 
	// 1. (exist_start <= req_end AND exist_end >= req_end) -> collision at end
	// 2. (exist_start <= req_start AND exist_end >= req_start) -> collision at start
	// 3. (exist_start >= req_start AND exist_end <= req_end) -> existing inside requested
	// Simpler standard overlap: NOT (end1 < start2 OR start1 > end2)
	// SQL: rent_start_date <= $2 AND rent_end_date >= $3 (where $2=req_end, $3=req_start)

	const overlapCheck = await query(
		`SELECT id FROM bookings
         WHERE vehicle_id = $1
         AND status = 'active'
         AND rent_start_date <= $3
         AND rent_end_date >= $2`,
		[vehicle_id, rent_start_date, rent_end_date]
	);

	if (overlapCheck.rows.length > 0) {
		throw new AppError("Vehicle is not available for the selected dates", 400);
	}


	return runTransaction(async (client) => {
		const vehicleResult = await client.query(
			"SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
			[vehicle_id]
		);

		if (vehicleResult.rows.length === 0) {
			throw new AppError("Vehicle not found", 404);
		}

		const vehicle = vehicleResult.rows[0];
		// If we only rely on overlaps, we might not need to check 'availability_status' strictly if it's just a cache, 
		// but requirement says "manage vehicle inventory with availability tracking".
		// "booked" status implies it's currently out. 
		// If the user wants to book for FUTURE, the current status 'booked' might not matter if it returns before start.
		// However, for simplicity and typical assignment requirements, if it's 'booked', it's unavailable.
		// BUT, better system is date-based. 
		// Given requirements: "Updates vehicle status to 'booked'". 
		// This implies a simple toggle. If 'booked', you can't book it.
		// I will keep the check: if status is 'booked', we can't book it, UNLESS the previous booking is what set it and it returns.
		// Actually, standard rent systems allow future bookings. 
		// But let's stick to the prompt: "Updates vehicle availability status".
		// It says "availability_status: 'available' or 'booked'".

		if (vehicle.availability_status !== "available") {
			throw new AppError("Vehicle is currently booked", 400);
		}

		const totalPrice = Number(vehicle.daily_rent_price) * days;
		const bookingResult = await client.query(
			`INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
			 VALUES ($1, $2, $3, $4, $5, 'active')
			 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
			[customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
		);

		await client.query(
			"UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
			[vehicle_id]
		);

		return {
			...bookingResult.rows[0],
			vehicle: {
				vehicle_name: vehicle.vehicle_name,
				daily_rent_price: Number(vehicle.daily_rent_price),
			},
		};
	});
};

export const getBookings = async (role: UserRole, userId: number) => {
	await autoReturnExpiredBookings();

	if (role === "admin") {
		const result = await query(
			`SELECT b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date,
							b.total_price, b.status,
							u.name as customer_name, u.email as customer_email,
							v.vehicle_name, v.registration_number
			 FROM bookings b
			 JOIN users u ON b.customer_id = u.id
			 JOIN vehicles v ON b.vehicle_id = v.id
			 ORDER BY b.id`
		);

		return result.rows.map((row) => ({
			id: row.id,
			customer_id: row.customer_id,
			vehicle_id: row.vehicle_id,
			rent_start_date: row.rent_start_date,
			rent_end_date: row.rent_end_date,
			total_price: Number(row.total_price),
			status: row.status,
			customer: {
				name: row.customer_name,
				email: row.customer_email,
			},
			vehicle: {
				vehicle_name: row.vehicle_name,
				registration_number: row.registration_number,
			},
		}));
	}

	const result = await query(
		`SELECT b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
						v.vehicle_name, v.registration_number, v.type
		 FROM bookings b
		 JOIN vehicles v ON b.vehicle_id = v.id
		 WHERE b.customer_id = $1
		 ORDER BY b.id`,
		[userId]
	);

	return result.rows.map((row) => ({
		id: row.id,
		vehicle_id: row.vehicle_id,
		rent_start_date: row.rent_start_date,
		rent_end_date: row.rent_end_date,
		total_price: Number(row.total_price),
		status: row.status,
		vehicle: {
			vehicle_name: row.vehicle_name,
			registration_number: row.registration_number,
			type: row.type,
		},
	}));
};

export const updateBookingStatus = async (
	bookingId: number,
	status: string,
	actor: { id: number; role: UserRole }
) => {
	ensure(isValidBookingStatus(status), "Invalid status");

	return runTransaction(async (client) => {
		const bookingResult = await client.query(
			"SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE id = $1",
			[bookingId]
		);

		if (bookingResult.rows.length === 0) {
			throw new AppError("Booking not found", 404);
		}

		const booking = bookingResult.rows[0] as Booking;

		if (actor.role === "customer") {
			if (booking.customer_id !== actor.id) {
				throw new AppError("Forbidden", 403);
			}
			if (status !== "cancelled") {
				throw new AppError("Forbidden", 403);
			}
			if (booking.status !== "active") {
				throw new AppError("Booking is not active", 400);
			}

			const startDate = new Date(booking.rent_start_date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			startDate.setHours(0, 0, 0, 0);
			if (startDate <= today) {
				throw new AppError("Booking cannot be cancelled after start date", 400);
			}

			const updated = await client.query(
				"UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
				[bookingId]
			);

			await client.query(
				"UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
				[booking.vehicle_id]
			);

			return updated.rows[0];
		}

		if (actor.role === "admin") {
			if (status !== "returned") {
				throw new AppError("Forbidden", 403);
			}
			if (booking.status !== "active") {
				throw new AppError("Booking is not active", 400);
			}

			const updated = await client.query(
				"UPDATE bookings SET status = 'returned' WHERE id = $1 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
				[bookingId]
			);

			await client.query(
				"UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
				[booking.vehicle_id]
			);

			return {
				...updated.rows[0],
				vehicle: { availability_status: "available" },
			};
		}

		throw new AppError("Forbidden", 403);
	});
};
