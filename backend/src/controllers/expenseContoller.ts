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

export const getExpense = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    const id = Number(req.params.id);

    const expense = await ExpenseServices.getExpense(id, userId, role);

    res.status(200).json({ status: "success", data: { expense } });
  },
);
