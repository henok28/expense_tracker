import { prisma } from "../lib/prisma.js";

import AppError from "../utils/AppError.js";

export type UpdateUserInput = {
  fullname?: string;
  email?: string;
  phone?: string;
};

const filteredObject = (
  obj: Record<string, unknown>,
  allowedFileds: string[],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  allowedFileds.forEach((field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });
  return result;
};

// Getting user by id

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) throw new AppError("User not found", 404);

  const { password_hash, ...safeUserDate } = user;

  return safeUserDate;
};

export const updateMe = async (id: number, body: Record<string, unknown>) => {
  const filteredData = filteredObject(body, ["fullname", "email", "phone"]);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: filteredData,
  });

  const { password_hash, ...safeUserDate } = updatedUser;

  return safeUserDate;
};

export const deactiveMe = async (id: number) => {
  await prisma.user.update({ where: { id }, data: { active: false } });
};

// Admin routes
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { active: true },
    omit: { password_hash: true },
  });

  return users;
};

export const getUser = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const { password_hash, ...safeUserData } = user;

  return safeUserData;
};

export const adminUpdateUser = async (
  id: number,
  body: Record<string, unknown>,
) => {
  const filteredFiled = filteredObject(body, [
    "fullname",
    "email",
    "phone",
    "role",
    "active",
  ]);

  const user = await prisma.user.update({
    where: { id },
    data: filteredFiled,
  });

  const { password_hash, ...safeUserData } = user;

  return safeUserData;
};

export const adminDeactivateUser = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) throw new AppError("User not found", 404);
  await prisma.user.update({ where: { id }, data: { active: false } });
};
