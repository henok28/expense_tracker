import { Request, Response, NextFunction } from "express";
import { AuthService, SignupInput } from "../services/authService.js";

export const signup = async (
  req: Request<{}, {}, SignupInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Giving the business logic to the service
    const { user, token } = await AuthService.signup(req.body);

    // creating secure cookie
    const cookieExpirationDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 1;
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + cookieExpirationDays * 24 * 60 * 60 * 1000,
      ),
    });

    // Sending response
    res.status(200).json({ status: "Sucess", token, data: { user } });
  } catch (error: any) {
    res
      .status(400)
      .json({ status: "Failed", message: error.message || "Signup Failed" });
  }
};
