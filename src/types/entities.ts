export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
}

export type VehicleType = "car" | "bike" | "van" | "SUV";
export type VehicleStatus = "available" | "booked";

export interface Vehicle {
  id: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleStatus;
}

export type BookingStatus = "active" | "cancelled" | "returned";

export interface Booking {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_price: number;
  status: BookingStatus;
}
