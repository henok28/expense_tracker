import { prisma } from "../lib/prisma.js";
import { ExpenseStatus, ExpenseType } from "../../generated/prisma/enums.js";
import AppError from "../utils/AppError.js";

export interface CreateExpenseInput {
  amount: number;
  description: string;
  transaction_date: string;
  expense_type: ExpenseType;
  categoryId: number;
}

export class ExpenseServices {
  static async createExpense(userId: number, body: CreateExpenseInput) {
    const { amount, description, transaction_date, expense_type, categoryId } =
      body;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId: userId }],
      },
    });

    if (!category)
      throw new AppError(
        "Category not found or you do not have access to it",
        404,
      );

    // Guard if not business

    if (expense_type === ExpenseType.BUSINESS && category.userId !== null) {
      throw new AppError(
        "Business expenses must be filed under a company-wide category",
        400,
      );
    }

    // Updating the status
    const status =
      expense_type === ExpenseType.PERSONAL
        ? ExpenseStatus.NOT_APPLICABLE
        : ExpenseStatus.PENDING;

    //constructing and sending the data obj

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        transaction_date: new Date(transaction_date),
        expense_type,
        status,
        userId,
        categoryId,
      },
    });

    // finally returning it
    return expense;
  }
}
