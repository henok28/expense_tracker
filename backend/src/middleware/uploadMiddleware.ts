import { Request } from "express";
import AppError from "../utils/AppError.js";
import multer, { FileFilterCallback } from "multer";
import crypto from "crypto";
import path from "path";

// First configuring the disk storage

const storage = multer.diskStorage({
  // Tells multer WHERE to write the incoming file bytes
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "uploads/receipts");
  },

  // Tells multer WHAT to name the file on disk
  filename: (req: Request, file: Express.Multer.File, cb) => {
    //1.extracting the file extention names
    const ext = path.extname(file.originalname).toLowerCase();

    //2. Generating 8 randome bytes
    const randomHex = crypto.randomBytes(8).toString("hex");

    //3. Getting the authenticated user id
    const userId = req.user?.id ? `user ${req.user.id}` : "Unknown";

    //4 constructing result
    const uniqueFileName = `receipt-${userId}-${Date.now()}-${randomHex}${ext}`;

    // Passing null to error and finishing
    cb(null, uniqueFileName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  // Allowed fields
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Rejects it if teh file type are different from the allowed ones
    cb(
      new AppError(
        "Invalid file format! Only images (JPEG, PNG, WEBP) and PDF files are allowed.",
        400,
      ),
    );
  }
};

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("receipt");
