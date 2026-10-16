// 1. Read Configuration (.env)
import "dotenv/config";

// 2. Initialize Express Application

import express, { Application, Request, Response } from "express";
import cors from "cors";
import { timeStamp } from "node:console";

//
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

const app: Application = express();

// 3. Register Core Middleware (CORS, JSON Parser)
app.use(cors());
app.use(express.json());

// 4. Register Health Check Endpoint (GET /health)
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Success",
    timestamp: new Date().toISOString(),
  });
});

// Mounting auth route
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

app.listen(5000, () => {
  console.log("Server running");
});
