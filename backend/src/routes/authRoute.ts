import { Request, Response, Router } from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { Role } from "../../generated/prisma/enums.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// // Temporary test route to test the protected routes
// router.get("/me", protect, (req: Request, res: Response) => {
//   // console.log(res);
//   res
//     .status(200)
//     .json({ status: "Success", message: "Protected route working" });
// });

router.get(
  "/admin/users",
  protect,
  restrictTo([Role.ADMIN]),
  (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome Admin!" });
  },
);

export default router;
