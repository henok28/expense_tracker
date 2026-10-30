import { Request, Response, NextFunction } from "express";
import {
  ExpenseServices,
  GetExpenseQuery,
} from "../services/expenseService.js";
import catchAsync from "../utils/catchAsync.js";
import {
  ExpenseStatus,
  ExpenseType,
  Role,
} from "../../generated/prisma/enums.js";
import AppError from "../utils/AppError.js";

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

export const getAllExpenses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const expense_type = req.query.expense_type as ExpenseType | undefined;

    const status = req.query.status as ExpenseStatus | undefined;

    const userIdFromQuery = req.query.userId
      ? Number(req.query.userId)
      : undefined;

    const query: GetExpenseQuery = {
      ...(expense_type && { expense_type }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(userIdFromQuery && { userId: userIdFromQuery }),
    };

    if (
      role === Role.USER &&
      userIdFromQuery !== undefined &&
      userId !== userIdFromQuery
    ) {
      return next(new AppError("You can only access your own expenses", 403));
    }

    if (
      role === Role.ADMIN &&
      expense_type !== undefined &&
      expense_type !== ExpenseType.BUSINESS
    ) {
      return next(new AppError("Admins can only view Business expenses", 403));
    }

    const expenses = await ExpenseServices.getAllExpenses(userId, role, query);

    res.status(200).json({ status: "success", data: { expenses } });
  },
);

export const updateExpense = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const expenseId = Number(req.params.id);

    const updatedData = await ExpenseServices.updateExpense(
      userId,
      expenseId,
      req.body,
    );

    res.status(200).json({ status: "success", data: { expense: updatedData } });
  },
);

export const deleteExpense = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const expenseId = Number(req.params.id);

    await ExpenseServices.deleteExpense(userId, expenseId);

    res.status(204).json({ status: "success", data: { expense: null } });
  },
);
