import { Router } from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { Role } from "../../generated/prisma/enums.js";
import {
  approveClaim,
  getPendingClaims,
  reimburseClaim,
  rejectClaim,
} from "../controllers/reimbursementController.js";

const router = Router();

router.use(protect, restrictTo([Role.ADMIN]));
router.route("/pending").get(getPendingClaims);

router.route("/:id/approve").patch(approveClaim);
router.route("/:id/reject").patch(rejectClaim);
router.route("/:id/reimburse").patch(reimburseClaim);

export default router;
