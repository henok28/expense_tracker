import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createExpense, getExpense } from "../controllers/expenseContoller.js";

const router = Router();

router.use(protect);

router.route("/").post(createExpense);
router.route("/:id").get(getExpense);

export default router;
