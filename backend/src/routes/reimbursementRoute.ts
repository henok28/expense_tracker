import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { Role } from "../../generated/prisma/enums.js";
import { getPendingClaims } from "../controllers/reimbursementController.js";

const router = Router();

router.use(protect, restrictTo([Role.ADMIN]));
router.route("/pending").get(getPendingClaims);

export default router;
