import express from "express";
import {
  startViva,
  submitAnswer,
  getResult,
} from "../controllers/vivaController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/:projectId/start",
  isAuthenticated,
  isAuthorized("Student"),
  startViva
);

router.post(
  "/:sessionId/answer",
  isAuthenticated,
  isAuthorized("Student"),
  submitAnswer
);

router.get(
  "/:sessionId/result",
  isAuthenticated,
  isAuthorized("Student"),
  getResult
);

export default router;
