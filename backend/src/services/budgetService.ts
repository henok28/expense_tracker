import { Prisma } from "../../generated/prisma/client.js";
import { Role } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";

export interface CreateBudgetInput {
  amount: number;
  month: number;
  year: number;
  categoryId: number;
}

export interface GetBudgetQuery {
  month?: number;
  year?: number;
  categoryId?: number;
}

export class BudgetService {
  static async createBudget(
    userId: number,
    role: Role,
    data: CreateBudgetInput,
  ) {
    const { amount, month, year, categoryId } = data;

    if (!amount || amount <= 0) {
      throw new AppError("Budget amount must be greater than zero", 400);
    }

    if (!month || month < 1 || month > 12) {
      throw new AppError("Month must be an integer between 1 and 12", 400);
    }

    const currentYear = new Date().getFullYear();
    if (!year || year < currentYear || year > currentYear + 10) {
      throw new AppError(
        `Year must be between ${currentYear} and ${currentYear + 10}`,
        400,
      );
    }
    if (isNaN(userId)) throw new AppError("Invalid user id", 400);
    if (isNaN(categoryId)) throw new AppError("Invalid category id", 400);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new AppError("Category Not found", 404);

    if (role === Role.USER) {
      if (category.userId !== null && category.userId !== userId) {
        throw new AppError(
          "You do not have permission to budget for this category",
          403,
        );
      }
    }

    // here i am checking for their role and settting the userId accordingly
    let targetUserId: number | null = role === Role.ADMIN ? null : userId;

    // ProActive validation
    const existingBudget = await prisma.categoryBudget.findFirst({
      where: {
        categoryId,
        month,
        year,
        userId: targetUserId,
      },
    });

    if (existingBudget) {
      const ownerType = role === Role.ADMIN ? "A company" : "A personal";
      throw new AppError(
        `${ownerType} budget for category ${category.category_name} for month ${month}/${year} already exist, Please update the existing budget instead.`,
        400,
      );
    }

    // Save
    return await prisma.categoryBudget.create({
      data: {
        amount,
        month,
        year,
        categoryId,
        userId: targetUserId,
      },
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
    });
  }

  static async getAllBudget(userId: number, role: Role, query: GetBudgetQuery) {
    if (isNaN(userId)) throw new AppError("Invalid User ID", 400);

    let where: Prisma.CategoryBudgetWhereInput = {};

    let targetUserId: number | null = role === Role.ADMIN ? null : userId;
    where = { ...query, userId: targetUserId };

    return await prisma.categoryBudget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  static async getBudget(budgetId: number, userId: number, role: Role) {
    if (isNaN(budgetId)) throw new AppError("Invalid budget ID", 400);
    if (isNaN(userId)) throw new AppError("Invalid user ID", 400);

    const budget = await prisma.categoryBudget.findUnique({
      where: { id: budgetId },
      include: { category: { select: { id: true, category_name: true } } },
    });

    if (!budget) throw new AppError("Budget not found", 404);

    if (role === Role.ADMIN && budget.userId !== null)
      throw new AppError("Admins can only access a company-wide budget", 403);

    if (role === Role.USER && budget.userId !== userId)
      throw new AppError("You can only access your own personal budgets", 403);

    return budget;
  }
}
