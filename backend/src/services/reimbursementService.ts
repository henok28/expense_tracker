import { ExpenseStatus, ExpenseType } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";

export class AdminExpenseService {
  static async getPendingClaims() {
    return await prisma.expense.findMany({
      where: {
        AND: [
          { expense_type: ExpenseType.BUSINESS },
          { status: ExpenseStatus.PENDING },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
      },
      orderBy: {
        transaction_date: "asc",
      },
    });
  }

  static async approveClaim(expenseId: number) {
    if (isNaN(expenseId)) throw new AppError("Invalid ID", 400);

    // check if expense exist
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new AppError("Expense not found", 404);

    // checking if expens is business and in pending state
    if (expense.expense_type !== ExpenseType.BUSINESS)
      throw new AppError(
        "You can only update the state of expense that belong to business type",
        400,
      );

    if (expense.status !== ExpenseStatus.PENDING)
      throw new AppError(
        `cant update claim, only pending states can be approved current state is ${expense.status}`,
        400,
      );

    return await prisma.expense.update({
      where: { id: expense.id },
      data: { status: ExpenseStatus.APPROVED },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        category: { select: { id: true, category_name: true } },
      },
    });
  }

  static async rejectClaim(expenseId: number, rejection_reason: string) {
    if (isNaN(expenseId)) throw new AppError("Invalid ID", 400);

    // check if expense exist
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) throw new AppError("Expense not found", 404);

    // checking if expens is business and in pending state
    if (expense.expense_type !== ExpenseType.BUSINESS)
      throw new AppError(
        "You can only update the state of expense that belong to business type",
        400,
      );

    if (expense.status !== ExpenseStatus.PENDING)
      throw new AppError(
        `cant update claim, only pending states can be approved current state is ${expense.status}`,
        400,
      );

    return await prisma.expense.update({
      where: { id: expense.id },
      data: {
        status: ExpenseStatus.REJECTED,
        rejection_reason: rejection_reason.trim(),
      },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        category: { select: { id: true, category_name: true } },
      },
    });
  }
}
