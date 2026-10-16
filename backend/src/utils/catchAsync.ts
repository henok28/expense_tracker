import { Request, Response, NextFunction } from "express";

type asyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

const catchAsync = (fn: asyncFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
