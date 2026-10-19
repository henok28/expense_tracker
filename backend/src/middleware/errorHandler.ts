import { Request, Response, NextFunction } from "express";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }

  console.error("Error 🧨: ", err);

  res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again later",
  });
};

export default globalErrorHandler;
