import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { BudgetService, GetBudgetQuery } from "../services/budgetService.js";

export const createBudget = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const { amount, month, year, categoryId } = req.body;
    const userId = req.user!.id;
    const role = req.user.role;

    const budget = await BudgetService.createBudget(userId, role, req.body);

    res.status(201).json({ status: "success", data: { budget } });
  },
);

export const getAllBudgets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const role = req.user.role;

    // const { amount, month, year } = req.query;

    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    const query: GetBudgetQuery = {
      ...(month && { month }),
      ...(year && { year }),
      ...(categoryId && { categoryId }),
    };

    const budgets = await BudgetService.getAllBudget(userId, role, query);

    res
      .status(200)
      .json({ status: "success", result: budgets.length, data: { budgets } });
  },
);

export const getBudget = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const budgetId = Number(req.params.id);
    const userId = Number(req.user!.id);
    const role = req.user.role;

    const budget = await BudgetService.getBudget(budgetId, userId, role);
    res.status(200).json({ status: "success", data: { budget } });
  },
);

export const updateBudget = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const budgetId = Number(req.params.id);
    const userId = Number(req.user!.id);
    const role = req.user.role;
    const { amount } = req.body;

    const budget = await BudgetService.updateBudget(
      budgetId,
      userId,
      role,
      amount,
    );
    res.status(200).json({ status: "success", data: { budget } });
  },
);

export const deleteBudget = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const budgetId = Number(req.params.id);
    const userId = Number(req.user!.id);
    const role = req.user.role;

    await BudgetService.deleteBudget(budgetId, userId, role);

    res.status(204).json({ status: "success", data: null });
  },
);
