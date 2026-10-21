import { Role } from "../../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";

export interface CreateCategoryInput {
  category_name: string;
  category_description?: string;
  is_company_category?: boolean;
}

export interface UpdateCategoryInput {
  category_name?: string;
  category_description?: string;
}

//
export class CategoryServices {
  static async createCategory(
    userId: number,
    role: Role,
    data: CreateCategoryInput,
  ) {
    let targetUserId: number | null = userId;

    if (data.is_company_category) {
      if (role !== Role.ADMIN) {
        throw new AppError(
          "Only Admins can create company-wide categories",
          403,
        );
      } else {
        targetUserId = null;
      }
    }

    const category = await prisma.category.create({
      data: {
        category_name: data.category_name,
        category_desciption: data.category_description,
        userId: targetUserId,
      },
    });

    return category;
  }
  // this is for user not admin
  static async getAllCategories(userId: number) {
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: userId }],
      },
      orderBy: {
        category_name: "asc",
      },
    });

    return categories;
  }

  // getting a single category if its mine or the companies
  static async getCategory(categoryId: number, userId: number) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new AppError("Category not found", 404);

    if (category.userId !== null && userId !== category.userId) {
      throw new AppError("You dont have permission to view this category", 403);
    }

    return category;
  }

  static async updateCategory(
    categoryId: number,
    userId: number,
    role: Role,
    data: UpdateCategoryInput,
  ) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) throw new AppError("Category not found", 404);

    if (existingCategory.userId === null) {
      //
      if (role != Role.ADMIN) {
        throw new AppError(
          "You cant edit company wide categories, contact the Admins",
          403,
        );
      }
    } else if (existingCategory.userId !== userId) {
      throw new AppError("You can only edit your own personal categories", 403);
    }

    /**
     * Whenever you have "exactOptionalPropertyTypes": true in tsconfig.json, never pass an optional field directly into an object literal unless you know it is defined. Either check with if (val !== undefined) or use an object filtering utility so that keys with undefined values are omitted entirely.
     */
    const updateData: {
      category_name?: string;
      category_description?: string;
    } = {};

    if (data.category_name !== undefined)
      updateData.category_name = data.category_name;
    if (data.category_description !== undefined)
      updateData.category_description = data.category_description;

    // performing an update
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return updated;
  }

  static async deleteCategory(categoryId: number, userId: number, role: Role) {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { expenses: true } } },
    });

    if (!existingCategory) {
      throw new AppError("Category not found", 404);
    }

    if (existingCategory?.userId === null) {
      if (role !== Role.ADMIN) {
        throw new AppError(
          "You cant edit delete wide categories, contact the Admins",
          403,
        );
      }
    } else if (existingCategory?.userId != userId) {
      throw new AppError(
        "You can only delete your own personal categories",
        403,
      );
    }

    // referential safety
    if (existingCategory._count.expenses > 0) {
      throw new AppError(
        `Cannot delete this category because ${existingCategory._count.expenses} expense(s) are linked to it. Reassign those expenses first.`,
        400,
      );
    }

    //
    await prisma.category.delete({ where: { id: existingCategory.id } });
  }
}
