import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { createBooking, getBookings, updateBookingStatus } from "./booking.service";
import { parseId } from "../../utils/ids";
import { AppError } from "../../utils/appError";

export const createBookingHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const actor = req.user!;
		const payload = req.body;

		if (actor.role === "customer") {
			if (payload.customer_id && Number(payload.customer_id) !== actor.id) {
				throw new AppError("Forbidden", 403);
			}
			payload.customer_id = actor.id;
		}

		const booking = await createBooking(payload);
		sendSuccess(res, 201, "Booking created successfully", booking);
	}
);

export const getBookingsHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const actor = req.user!;
		const bookings = await getBookings(actor.role, actor.id);
		const message =
			actor.role === "admin"
				? "Bookings retrieved successfully"
				: "Your bookings retrieved successfully";
		sendSuccess(res, 200, message, bookings);
	}
);

export const updateBookingHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const bookingId = parseId(req.params.bookingId as string, "Invalid booking id");
		const status = req.body?.status;
		const actor = req.user!;

		const updated = await updateBookingStatus(bookingId, status, actor);
		const message =
			status === "cancelled"
				? "Booking cancelled successfully"
				: "Booking marked as returned. Vehicle is now available";

		sendSuccess(res, 200, message, updated);
	}
);
