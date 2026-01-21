import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import { deleteUserById, getUsers, updateUserById } from "./user.controller";

const router = Router();

router.get("/", authMiddleware, allowRoles("admin"), getUsers);
router.put("/:userId", authMiddleware, updateUserById);
router.delete("/:userId", authMiddleware, allowRoles("admin"), deleteUserById);

export default router;
