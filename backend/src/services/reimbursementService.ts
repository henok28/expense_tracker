import { ExpenseStatus, ExpenseType } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

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
}
