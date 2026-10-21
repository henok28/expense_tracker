import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { CategoryServices } from "../services/categoryService.js";
import AppError from "../utils/AppError.js";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const role = req.user!.role;

    const category = await CategoryServices.createCategory(
      userId,
      role,
      req.body,
    );

    res.status(200).json({ status: "success", data: { category } });
  },
);
// getting all companies and self categories
export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const categories = await CategoryServices.getAllCategories(userId);

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  },
);
// Getting a category
export const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const categoryId = Number(req.params.id);

    if (isNaN(categoryId))
      return next(new AppError("Invalid Category id", 400));

    const category = await CategoryServices.getCategory(categoryId, userId);

    res.status(200).json({ status: "success", data: { category } });
  },
);

// PATCH updataing a category
export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = Number(req.params.id);
    if (isNaN(categoryId)) return next(new AppError("Invalid Id", 400));
    const userId = req.user!.id;
    const role = req.user!.role;

    const updatedCategory = await CategoryServices.updateCategory(
      categoryId,
      userId,
      role,
      req.body,
    );

    res.status(203).json({ status: "success", data: { updatedCategory } });
  },
);

// Deleting category

export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = Number(req.params.id);
    if (isNaN(categoryId)) return next(new AppError("Invalid Id", 400));
    const userId = req.user!.id;
    const role = req.user!.role;

    await CategoryServices.deleteCategory(categoryId, userId, role);

    res.status(204).json({ status: "success", data: null });
  },
);
