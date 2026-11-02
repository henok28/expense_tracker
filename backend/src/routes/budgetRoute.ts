import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBudget,
  deleteBudget,
  getAllBudgets,
  getBudget,
  updateBudget,
} from "../controllers/budgetController.js";

const router = Router();
router.use(protect);

router.route("/").post(createBudget).get(getAllBudgets);

router.route("/:id").get(getBudget).patch(updateBudget).delete(deleteBudget);

export default router;
