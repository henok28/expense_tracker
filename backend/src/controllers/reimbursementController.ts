import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { AdminExpenseService } from "../services/reimbursementService.js";
import AppError from "../utils/AppError.js";

export const getPendingClaims = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const claims = await AdminExpenseService.getPendingClaims();

    res
      .status(200)
      .json({ status: "success", results: claims.length, data: { claims } });
  },
);

export const approveClaim = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const expenseId = Number(req.params.id);

    const claim = await AdminExpenseService.approveClaim(expenseId);

    res.status(200).json({ status: "success", data: { claim } });
  },
);

export const rejectClaim = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const expenseId = Number(req.params.id);
    const { rejection_reason } = req.body ?? {};

    if (!rejection_reason || rejection_reason.trim().length === 0) {
      return next(
        new AppError(
          "A rejection reason is required when rejecting a claim",
          400,
        ),
      );
    }

    const claim = await AdminExpenseService.rejectClaim(
      expenseId,
      rejection_reason,
    );

    res.status(200).json({ status: "success", data: { claim } });
  },
);

export const reimburseClaim = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const expenseId = Number(req.params.id);

    const claim = await AdminExpenseService.reimburseClaim(expenseId);

    res.status(200).json({ status: "success", data: { claim } });
  },
);
