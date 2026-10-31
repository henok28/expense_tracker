import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import { AdminExpenseService } from "../services/reimbursementService.js";

export const getPendingClaims = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const claims = await AdminExpenseService.getPendingClaims();

    res
      .status(200)
      .json({ status: "success", results: claims.length, data: { claims } });
  },
);
