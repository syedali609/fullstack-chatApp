import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createGroup, getMyGroups, getGroupMessages, sendGroupMessage, leaveGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/messages/:groupId", protectRoute, getGroupMessages); // Corrected
router.post("/send/:groupId", protectRoute, sendGroupMessage); // Corrected
router.post("/:groupId/leave", protectRoute, leaveGroup);

export default router;