import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
	createBookingHandler,
	getBookingsHandler,
	updateBookingHandler,
} from "./booking.controller";

const router = Router();

router.post("/", authMiddleware, createBookingHandler);
router.get("/", authMiddleware, getBookingsHandler);
router.put("/:bookingId", authMiddleware, updateBookingHandler);

export default router;
