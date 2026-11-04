import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  attachReceipt,
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpense,
  getExpenseReceipt,
  updateExpense,
} from "../controllers/expenseContoller.js";
import { uploadReceipt } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(protect);

router.route("/").post(createExpense).get(getAllExpenses);
router.route("/:id").get(getExpense).patch(updateExpense).delete(deleteExpense);

// Expense Route
router
  .route("/:id/receipt")
  .patch(uploadReceipt, attachReceipt)
  .get(getExpenseReceipt);

export default router;
