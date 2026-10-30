import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createExpense,
  getAllExpenses,
  getExpense,
  updateExpense,
} from "../controllers/expenseContoller.js";

const router = Router();

router.use(protect);

router.route("/").post(createExpense).get(getAllExpenses);
router.route("/:id").get(getExpense).patch(updateExpense);

export default router;
