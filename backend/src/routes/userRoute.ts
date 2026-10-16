import { Router } from "express";
import {
  getMe,
  updateMe,
  deleteMe,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { Role } from "../../generated/prisma/enums.js";

const router = Router();

router.use(protect); //every thing defined below here usese the protect middleware

router.get("/me", getMe);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

//admin routes
router.use(restrictTo([Role.ADMIN]));

router.get("/", getAllUsers);

router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
