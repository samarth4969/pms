import {asyncHandler} from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import VivaSession from "../models/vivaSession.js";
  import Project from "../models/project.js";
import { generateVivaQuestions, evaluateAnswer } from "../services/aiService.js";


// 1️⃣ START VIVA
export const startViva = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.student.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  const questions = await generateVivaQuestions(project);

  const vivaSession = await VivaSession.create({
    student: studentId,
    project: projectId,
    questions,
    answers: [],
    totalScore: 0,          // ✅ IMPORTANT
    status: "ongoing",
  });

  res.status(201).json({
    success: true,
    message: "Viva started",
    data: {
      sessionId: vivaSession._id,
      questions,
    },
  });
});




// 2️⃣ SUBMIT ANSWER
export const submitAnswer = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const { question, answer } = req.body;

  const session = await VivaSession.findById(sessionId);

  if (!session) {
    return next(new ErrorHandler("Session not found", 404));
  }

  if (session.status === "completed") {
    return next(new ErrorHandler("Viva already completed", 400));
  }

  // 🔥 AI returns TEXT (not object)
  const evaluationText = await evaluateAnswer(question, answer);

  // ✅ Extract score using REGEX
  const scoreMatch = evaluationText.match(/Score[:\s]*?(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

  const safeScore = isNaN(score) ? 0 : score;

  // ✅ Store answer properly
  session.answers.push({
    question,
    answer,
    feedback: evaluationText,
    score: safeScore,
  });

  // ✅ Safe totalScore update
  session.totalScore = (session.totalScore || 0) + safeScore;

  await session.save();

  res.status(200).json({
    success: true,
    message: "Answer evaluated",
    data: {
      feedback: evaluationText,
      score: safeScore,
      totalScore: session.totalScore,
    },
  });
});




// 3️⃣ COMPLETE VIVA & GET RESULT
export const getResult = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await VivaSession.findById(sessionId)
    .populate("student", "name email")
    .populate("project", "title");

  if (!session) {
    return next(new ErrorHandler("Session not found", 404));
  }

  session.status = "completed";
  await session.save();

  const totalQuestions = session.questions.length;
  const totalScore = session.totalScore || 0;

  const totalMarks = totalQuestions * 10; // assuming 10 per question

  const percentage =
    totalMarks > 0
      ? ((totalScore / totalMarks) * 100).toFixed(2)
      : 0;

  res.status(200).json({
    success: true,
    data: {
      student: session.student,
      project: session.project,
      score: totalScore,
      total: totalMarks,
      percentage,
      answers: session.answers,
    },
  });
});



