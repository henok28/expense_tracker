/**
 * this file is a protect middle ware meaning that before it reaches our cotroller their are some checkups that has to be made so first
 * 1, i have to check weather their is a token or not in teh first place
 * 2, after that i have to also check it the existing token is really valid or not, like is it expired or not
 * 3, and if the token is valid i have to decode it and also check if the user still exists in the data base : the reason for this is that after a user is deactivated or deleted by the admin the token is matimatically correct if the expiration date is not due so that also have to be checked
 * 4, finally i have to check if the token issued date and the passwrod changed date sounds, the reason for that is lets say a user account have been compromized and the user changes its password and recive a new token, the old token works unless discarded so the way to check is that by comparing the token initiated time and the password changed time and check if the password change time is greated if so we have to redirect the user flow to the login since token initiation is a past activity in this case.
 */
import { NextFunction, Response, Request } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthService, type DecodedToken } from "../services/authService.js";
import { Role } from "../../generated/prisma/client.js";
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1.CHECKING IF THEIR IS TOKEN
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Checking for cookie also
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token)
      return res.status(401).json({
        status: "Failed",
        message: "You are not logged in, Please login to get access",
      });

    // 2. VERIFYING THE TOKEN VALIDITY(SIGNITURE AND EXPIRATION)
    let decoded: DecodedToken;
    try {
      decoded = AuthService.verifyToken(token);
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "fail",
          message: "Token expired, Please login again",
        });
      }

      return res
        .status(401)
        .json({ status: "fail", message: "Invalid token, Please login" });
    }

    // 3. CHECKING IF THE USER EXISTS IN THE DB
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id, active: true },
    });

    if (!currentUser)
      return res.status(401).json({
        status: "Failed",
        message: "The account that belongs to this token no longer exists",
      });

    // 4. CHECKING IF THE USER CHANGED THE PASSWORD AFTER TOKEN HAS BEEN ISSUED
    if (currentUser.password_changed_at) {
      const passwordChangedSeconds = Math.floor(
        currentUser.password_changed_at.getTime() / 1000,
      );
      if (decoded.iat < passwordChangedSeconds) {
        return res.status(401).json({
          status: "Failed",
          message: "Invalid token, try logging again",
        });
      }
    }

    // IF ALL THE CONDITIONS ARE PASSED
    const { password_hash, ...safeUserData } = currentUser;
    req.user = safeUserData;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have a permission to perform this action",
      });
    }

    next();
  };
};
