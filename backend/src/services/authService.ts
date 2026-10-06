import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

import ms from "ms";

export interface SignupInput {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
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

  static async signup(input: SignupInput): Promise<AuthResult> {
    const { fullname, email, phone, password, passwordConfirm } = input;

    if (!fullname || !email || !phone || !password || !passwordConfirm) {
      throw new Error("ALL FIELDS ARE REQUIRED!");
    }

    if (password != passwordConfirm) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) throw new Error("User already exist");

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
}
