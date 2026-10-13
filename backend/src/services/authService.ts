import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

import ms from "ms";
import { Role } from "../../generated/prisma/enums.js";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { sendEmail } from "../utils/email.js";

export interface SignupInput {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResonse {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  created_at: Date;
}

export interface AuthResult {
  user: UserResonse;
  token: string;
}

// Protected route type defination
export interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
}

//here the reason for that is that on the express.d.ts the imported User was causing a problem by misiing the context, when ts misses the context and doesnt find User from the generated/prisma/client.js it makes the type any and any dont have any properties so that would resolve to an error to fix this i am going to the the AuthUser interface to be used as a type in my express.d.ts file
export interface AuthUser {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
  password_changed_at: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
}

export class AuthService {
  private static signToken(id: number): string {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    const rawExpiresIn = process.env.JWT_EXPIRES_IN || "90d";
    const expiresInSecond = Math.floor(
      ms(rawExpiresIn as ms.StringValue) / 1000,
    );
    return jwt.sign({ id }, secret, {
      expiresIn: expiresInSecond,
    });
  }

  static verifyToken(token: string): DecodedToken {
    const secret = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  }

  static async signup(input: SignupInput): Promise<AuthResult> {
    const { fullname, email, phone, password, passwordConfirm } = input;

    if (!fullname || !email || !phone || !password || !passwordConfirm) {
      throw new Error("ALL FIELDS ARE REQUIRED!");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) throw new Error("User already exist");

    if (password != passwordConfirm) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters");
    }

    // Hashing password
    const password_hash = await bcrypt.hash(password, 12);

    // Creating and storing the user
    const newUser = await prisma.user.create({
      data: {
        fullname,
        email: email.toLowerCase().trim(),
        phone,
        password_hash,
        role: "USER",
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
      },
    });

    //Generating JWT token and returning user
    const token = this.signToken(newUser.id);

    return { user: newUser, token };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    if (!email || !password)
      throw new Error("Please provide both email and password");

    // Checking if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) throw new Error("Incorrect Email or Password");

    // Comparing stored password with the candidate password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!isPasswordCorrect) throw new Error("Incorrect Email or Password");

    // if things are going well still now i will generate the token and return the user data

    const token = this.signToken(user.id);

    // before returning the data i have to strip it to make it safe so that sensetive datas are not visisble
    const { password_hash, ...safeUserData } = user;

    return { user: safeUserData, token };
  }

  static async forgotPassword(
    email: string,
    resetBaseUrl: string,
  ): Promise<void> {
    //1.  Finding user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    //Generic message for security puposes
    if (!user)
      throw new Error(
        "If user with this email exists,reset link have been sent with this email",
      );

    // 2. Generate raw token using crypto
    const resetToken = randomBytes(32).toString("hex");

    // 3) Hash it → store in DB

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const tokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // 4.SAVING THE HASHED TOKEN
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: hashedToken,
        password_reset_expires: tokenExpires,
      },
    });

    // 5. building the resturl and sending it
    const resetUrl = `${resetBaseUrl}/${resetToken}`;

    const message = `Forgot your password? Click the link to reset it:\n\n${resetUrl}\n\nThis link expires in 10 minutes.\nIf you didn't request this, ignore this email.`;

    //
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Token (valid for 10 minutes)",
        text: message,
      });
    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_reset_token: null,
          password_reset_expires: null,
        },
      });

      throw new Error("Error sending email. Please try again later");
    }
  }

  static async resetPassword(
    rawToken: string,
    password: string,
    passwordConfirm: string,
  ): Promise<AuthResult> {
    // first i will hash the raw token from the url
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Then find the user based on the hash

    const user = await prisma.user.findFirst({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) throw new Error("Token is invalid or expired");
    if (password !== passwordConfirm) throw new Error("Password do not match");

    if (password.length < 8)
      throw new Error("Password must contain at least 8 characters");

    const password_hash = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        password_changed_at: new Date(Date.now() - 1000),
        password_reset_expires: null,
        password_reset_token: null,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
        updated_at: true,
        password_changed_at: true,
        password_reset_token: true,
        password_reset_expires: true,
      },
    });

    // Generating new token
    const token = this.signToken(updatedUser.id);

    // finally returning the updated data
    return { user: updatedUser as AuthUser, token };
  }
}
