import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import {
  ExpenseServices,
  type CreateExpenseInput,
} from "../services/expenseService.js";
import catchAsync from "../utils/catchAsync.js";

export const createExpense = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const expense = await ExpenseServices.createExpense(userId, req.body);
    res.status(201).json({ status: "success", data: { expense } });
  },
);
