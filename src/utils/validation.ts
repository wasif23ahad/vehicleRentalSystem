import { AppError } from "./appError";
import { UserRole, VehicleStatus, VehicleType, BookingStatus } from "../types/entities";

export const isValidRole = (role: string): role is UserRole =>
  role === "admin" || role === "customer";

export const isValidVehicleType = (type: string): type is VehicleType =>
  type === "car" || type === "bike" || type === "van" || type === "SUV";

export const isValidVehicleStatus = (
  status: string
): status is VehicleStatus => status === "available" || status === "booked";

export const isValidBookingStatus = (
  status: string
): status is BookingStatus =>
  status === "active" || status === "cancelled" || status === "returned";

export const ensure = (condition: boolean, message: string, status = 400) => {
  if (!condition) {
    throw new AppError(message, status);
  }
};
