import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.getUser(req.user!.id);
    res.status(200).json({ status: "success", data: { user } });
  },
);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.password_hash)
      return next(new AppError("Cant update password on this route", 400));

    const user = await userService.updateMe(req.user!.id, req.body);
    res.status(200).json({ status: "success", data: { user } });
  },
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.deactiveMe(req.user!.id);
    res.status(204).json({ status: "success", data: null });
  },
);

// Admin controllers
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();

    res
      .status(200)
      .json({ status: "sucess", result: users.length, data: { users } });
  },
);

export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.getUserById(Number(req.params.id));

    res.status(200).json({ status: "success", data: { user } });
  },
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.adminUpdateUser(
      Number(req.params.id),
      req.body,
    );
    res.status(200).json({ status: "sucess", data: { user } });
  },
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.adminDeactivateUser(Number(req.params.id));
    res.status(204).json({ status: "sucess", data: null });
  },
);
