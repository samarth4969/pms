import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ErrorHandler } from "../middlewares/error.js";
import Deadline from "../models/deadline.js";
import Project from "../models/project.js";
import { getProjectById } from "../services/projectServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { User } from "../models/user.js";

export const createDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, dueDate } = req.body;

  if (!name || !dueDate) {
    return next(new ErrorHandler("Name and due date are required", 400));
  }

  const projectDoc = await getProjectById(id);
  if (!projectDoc) {
    return next(new ErrorHandler("Project not found", 404));
  }

  // 1️⃣ Create deadline document
  const deadline = await Deadline.create({
    name,
    dueDate: new Date(dueDate),
    createdBy: req.user._id,
    project: projectDoc._id,
  });

  await deadline.populate([
    { path: "createdBy", select: "name email" },
  ]);

  // 2️⃣ Update project deadline
  await Project.findByIdAndUpdate(
    projectDoc._id,
    { deadline: new Date(dueDate) },
    { new: true, runValidators: true }
  );

  // 3️⃣ 🔔 NOTIFY STUDENT (THIS WAS MISSING)
  if (projectDoc.student) {
    await notificationServices.notifyUser(
      projectDoc.student,
      `New deadline "${name}" has been set for your project. Due on ${new Date(dueDate).toDateString()}`,
      "deadline",
      "/student/dashboard",
      "high"
    );
  }

  return res.status(201).json({
    success: true,
    message: "Deadline created successfully and student notified",
    data: { deadline },
  });
});
