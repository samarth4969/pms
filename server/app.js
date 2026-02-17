
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./router/userRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import studentRouter from "./router/studentRoutes.js";
import teacherRouter from "./router/teacherRoutes.js";
import notificationRouter from "./router/notificationRoutes.js";
import deadlineRouter from "./router/deadlineRoutes.js";
import projectRouter from "./router/projectRoutes.js";
import vivaRouter from "./router/vivaRoutes.js";

import errorMiddleware from "./middlewares/error.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ✅ CORS */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ✅ Create Upload Folders */
const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/* ✅ BODY PARSERS */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ ROUTES */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deadline", deadlineRouter);
app.use("/api/v1/teacher", teacherRouter);
app.use("/api/v1/viva", vivaRouter);

/* ✅ ERROR HANDLER */
app.use(errorMiddleware);

export default app;
