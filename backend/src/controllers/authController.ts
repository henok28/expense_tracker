import { Request, Response, NextFunction } from "express";
import {
  AuthService,
  SignupInput,
  LoginInput,
} from "../services/authService.js";

const sendAuthResponse = (
  res: Response,
  statusCode: number,
  token: string,
  user: any,
) => {
  res.status(statusCode).json({ status: "Success", token, data: { user } });
};

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

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, token } = await AuthService.login(req.body);
    sendAuthResponse(res, 200, token, user);
  } catch (error: any) {
    res
      .status(401)
      .json({ status: "Failed", message: error.message || "Login failed" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const baseUrl = `${req.protocol}://${req.get("host")}/api/v1/resetPassword`;

    await AuthService.forgotPassword(email, baseUrl);

    res.status(200).json({
      status: "sucess",
      message: "If this email is registered, reset link is sent",
    });
  } catch (error: any) {
    res.status(500).json({ status: "fail", message: error.message + "llll" });
  }
};

interface ResetPasswordParams {
  token: string;
}
export const resetPassword = async (
  req: Request<ResetPasswordParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    /**
     * here i have this error repeatedly 
        {
        Argument of type 'string | string[] | undefined' is not assignable to parameter of type 'string'.
        Type 'undefined' is not assignable to type 'string'.
         }

         so this error persists becuz when type script checks the type their should not be ambiguity meaning if the type that i am passing resolved to 2 or 3 types like sting|array or undefined type script returns the abouve error so to solve that their are 3 ways

         1. bluntly forsing ts type checking to accept it as a prefered type
             const token = req.params.token as string;

         2. is more better option its to define its woen interface for it

     */
    const { token } = req.params;
    console.log(token);
    // const token = req.params.token as string;

    const { password, passwordConfirm } = req.body;

    const { user, token: jwtToken } = await AuthService.resetPassword(
      token,
      password,
      passwordConfirm,
    );

    sendAuthResponse(res, 200, token, user);
  } catch (error: any) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
