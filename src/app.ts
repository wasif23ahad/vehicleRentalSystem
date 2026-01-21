import "./config/env";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import vehicleRoutes from "./modules/vehicles/vehicle.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Vehicle Rental API running");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;
