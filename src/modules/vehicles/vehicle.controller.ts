import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
	createVehicle,
	deleteVehicle,
	getAllVehicles,
	getVehicleById,
	updateVehicle,
} from "./vehicle.service";
import { parseId } from "../../utils/ids";

export const createVehicleHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const vehicle = await createVehicle(req.body);
		sendSuccess(res, 201, "Vehicle created successfully", vehicle);
	}
);

export const getVehicles = asyncHandler(async (_req: Request, res: Response) => {
	const vehicles = await getAllVehicles();
	if (vehicles.length === 0) {
		sendSuccess(res, 200, "No vehicles found", []);
		return;
	}
	sendSuccess(res, 200, "Vehicles retrieved successfully", vehicles);
});

export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
	const vehicleId = parseId(req.params.vehicleId as string, "Invalid vehicle id");
	const vehicle = await getVehicleById(vehicleId);
	sendSuccess(res, 200, "Vehicle retrieved successfully", vehicle);
});

export const updateVehicleHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const vehicleId = parseId(req.params.vehicleId as string, "Invalid vehicle id");
		const vehicle = await updateVehicle(vehicleId, req.body);
		sendSuccess(res, 200, "Vehicle updated successfully", vehicle);
	}
);

export const deleteVehicleHandler = asyncHandler(
	async (req: Request, res: Response) => {
		const vehicleId = parseId(req.params.vehicleId as string, "Invalid vehicle id");
		await deleteVehicle(vehicleId);
		sendSuccess(res, 200, "Vehicle deleted successfully");
	}
);
