import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import authRouter from "./router/userRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import errorMiddleware from "./middlewares/error.js";

config();
const app = express();

/* ✅ CORS (FIXED) */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ✅ BODY PARSERS */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ ROUTES */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);

/* ✅ ERROR HANDLER */
app.use(errorMiddleware);

export default app;
