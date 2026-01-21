import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import {
	createVehicleHandler,
	deleteVehicleHandler,
	getVehicle,
	getVehicles,
	updateVehicleHandler,
} from "./vehicle.controller";

const router = Router();

router.post("/", authMiddleware, allowRoles("admin"), createVehicleHandler);
router.get("/", getVehicles);
router.get("/:vehicleId", getVehicle);
router.put(
	"/:vehicleId",
	authMiddleware,
	allowRoles("admin"),
	updateVehicleHandler
);
router.delete(
	"/:vehicleId",
	authMiddleware,
	allowRoles("admin"),
	deleteVehicleHandler
);

export default router;
