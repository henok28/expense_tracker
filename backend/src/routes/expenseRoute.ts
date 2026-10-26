import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createExpense } from "../controllers/expenseContoller.js";

const router = Router();

router.use(protect);

router.route("/").post(createExpense);

export default router;
