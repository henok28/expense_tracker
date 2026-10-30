import { prisma } from "../lib/prisma.js";
import {
  ExpenseStatus,
  ExpenseType,
  Role,
} from "../../generated/prisma/enums.js";
import AppError from "../utils/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";

export interface CreateExpenseInput {
  amount: number;
  description: string;
  transaction_date: string;
  expense_type: ExpenseType;
  categoryId: number;
}

export interface GetExpenseQuery {
  expense_type?: ExpenseType;
  status?: ExpenseStatus;
  categoryId?: number;
  userId?: number;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  transaction_date?: string;
  categoryId?: number;
}

// const filterObject = (
//   obj: Record<string, unknown>,
//   allowedFields: string[],
// ): Record<string, unknown> => {
//   const result: Record<string, unknown> = {};

//   allowedFields.forEach((field) => {
//     if (field in obj) {
//       result[field] = obj[field];
//     }
//   });

//   return result;
// };

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

  // Getting an expense by id
  static async getExpense(expenseId: number, userId: number, role: Role) {
    // first checking the expense exists and also make sure that the passed params is a number
    if (isNaN(expenseId)) throw new AppError("Invalid expense id", 400);
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new AppError("Expense Not Found", 404);

    if (role === Role.ADMIN) {
      if (expense.expense_type !== ExpenseType.BUSINESS) {
        throw new AppError("You do not have access to personal expenses", 403);
      }
      return expense;
    }

    //
    if (role === Role.USER) {
      if (expense.userId !== userId) {
        throw new AppError("You can only access your own expenses", 403);
      }

      return expense;
    }
  }

  static async getAllExpenses(
    userId: number,
    role: Role,
    query: GetExpenseQuery,
  ) {
    let where: Prisma.ExpenseWhereInput = {};
    let expense = null;

    if (role === Role.ADMIN) {
      where = { ...query, expense_type: ExpenseType.BUSINESS };
      expense = await prisma.expense.findMany({
        where,
        include: {
          category: true,
          user: { select: { id: true, fullname: true, email: true } },
        },
      });
    }

    if (role === Role.USER) {
      where = { ...query, userId: userId };
      expense = await prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { transaction_date: "desc" },
      });
    }

    return expense;
  }

  static async updateExpense(
    userId: number,
    expenseId: number,
    data: UpdateExpenseInput,
  ) {
    if (isNaN(expenseId)) throw new AppError("Invalid expense ID", 400);

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new AppError("Expense Not found", 404);

    if (userId !== expense.userId)
      throw new AppError("You can only update your own expense data", 403);

    // Status lock
    if (
      expense.status === ExpenseStatus.APPROVED ||
      expense.status === ExpenseStatus.REIMBURSED
    ) {
      throw new AppError(
        "Cannot edit an expense that has already been approved or reimbursed",
        400,
      );
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { userId: null }],
        },
      });

      if (!category)
        throw new AppError(
          "Category not found or you do not have access to it",
          404,
        );

      if (
        expense.expense_type === ExpenseType.BUSINESS &&
        category.userId !== null
      ) {
        throw new AppError(
          "Business expenses must be filed under a company-wide category",
          400,
        );
      }
    }

    const updatedPayload: Prisma.ExpenseUpdateInput = {};

    if (data.amount !== undefined) updatedPayload.amount = data.amount;
    if (data.description !== undefined)
      updatedPayload.description = data.description;
    if (data.transaction_date !== undefined)
      updatedPayload.transaction_date = new Date(data.transaction_date);

    if (data.categoryId !== undefined) {
      // updatedPayload.category = { connect: { id: data.categoryId } };
      updatedPayload.category = { connect: { id: data.categoryId } };
    }

    const updatedExpense = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: updatedPayload,
      include: { category: true },
    });

    return updatedExpense;
  }
}
