import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ErrorHandler } from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import * as fileServices from "../services/fileServices.js";
import { Notification } from "../models/notification.js";
import Project from "../models/project.js";
import { supervisorRequest } from "../models/supervisorRequest.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTemplates.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const totalPendingRequests = await supervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const assignedStudents = await Project.countDocuments({
    supervisor: teacherId,
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const pendingProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const recentNotifications = await Notification.find({ user: teacherId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      assignedStudents,       // ✅ THIS FIXES YOUR ISSUE
      totalPendingRequests,
      completedProjects,
      pendingProjects,
      recentNotifications,
    },
  });
});


export const getRequests = asyncHandler(async (req, res, next) => {
  const supervisorId = req.user._id; // ✅ from JWT (secure)

  const { requests, total } = await requestServices.getAllRequests({
    supervisor: supervisorId, // 🔥 ALWAYS FILTER
  });

  const updatedRequests = await Promise.all(
    requests.map(async (request) => {
      const requestObj = request.toObject
        ? request.toObject()
        : request;

      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }

      return requestObj;
    })
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully",
    data: {
      requests: updatedRequests,
      total,
    },
  });
});


export const acceptRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;
  const request = await requestServices.acceptRequest(requestId, teacherId);

  if (!request) return next(new ErrorHandler("Request not found", 404));

  await notificationServices.notifyUser(
    request.student._id,
    `Your supervisor request hase been accept by ${req.user.name}`,
    "approval",
    "/students/status",
    "low",
  );

  const student = await User.findById(request.student._id);
  const studentEmail = student.email;
  const message = generateRequestAcceptedTemplate(req.user.name);

  await sendEmail({
    to: studentEmail,
    subject: "FYP SYSTEM - YOUR SUPERVISOR REQUEST HAS BEEN ACCEPTED",
    message,
  });

  res.status(200).json({
    success: true,
    message: "Request accepted successfully",
    data: request,
  });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const teacherId = req.user._id;

  // 1️⃣ CORE LOGIC (must succeed)
  const request = await requestServices.rejectRequest(requestId, teacherId);
  if (!request) return next(new ErrorHandler("Request not found", 404));

  // 2️⃣ SIDE EFFECTS (must NOT break reject)
  try {
    if (request.student?._id) {
      await notificationServices.notifyUser(
        request.student._id,
        `Your supervisor request has been rejected by ${req.user.name}`,
        "rejection",
        "/students/status",
        "high",
      );

      const student = await User.findById(request.student._id);
      if (student?.email) {
        const message = generateRequestRejectedTemplate(req.user.name);
        await sendEmail({
          to: student.email,
          subject: "FYP SYSTEM - YOUR SUPERVISOR REQUEST HAS BEEN REJECTED",
          message,
        });
      }
    }
  } catch (err) {
    console.error("⚠ Reject side-effect failed:", err.message);
    // ❌ DO NOT throw
  }

  // 3️⃣ ALWAYS RESPOND SUCCESS
  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
    data: request,
  });
});

export const getAssignedStudents = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  // 1️⃣ Find projects supervised by this teacher
  const projects = await Project.find({ supervisor: teacherId })
    .populate("student", "name email")
    .sort({ updatedAt: -1 });

  // 2️⃣ Shape data for frontend
  const assignedStudents = projects.map((project) => ({
    ...project.student.toObject(),
    project,
  }));

  res.status(200).json({
    success: true,
    message: "Assigned students fetched successfully",
    data: assignedStudents,
  });
});

export const markComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(
      new ErrorHandler("Not authorized to mark this project complete", 403),
    );
  }
  const updatedProject = await projectServices.markComplete(projectId);

  await notificationServices.notifyUser(
  project.student._id,
  `Your project "${project.title}" has been marked as complete by ${req.user.name}`,
  "general",
  "/students/status",
  "low"
);



  res.status(200).json({
    success: true,
    message: "Project marked as complete successfully",
    data: {
      project: updatedProject,
    },
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  // ✅ INCLUDE PRIORITY WITH DEFAULT
  const {
    message,
    title,
    type = "general",
    priority = "medium", // ⭐ FIX
  } = req.body;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(
      new ErrorHandler("Not authorized to add feedback to this project", 403)
    );
  }

  if (!message || !title) {
    return next(
      new ErrorHandler("Please provide all required feedback fields", 400)
    );
  }

  const { project: updatedProject, latestFeedback } =
    await projectServices.addFeedback(
      projectId,
      teacherId,
      message,
      title,
      type,
      priority // ✅ pass it if your service supports it
    );

  // ✅ NOW priority EXISTS
 await notificationServices.notifyUser(
  project.student._id,
  `New feedback added to your project "${project.title}"`,
  "feedback",
  "/students/feedback",
  priority
);


  res.status(200).json({
    success: true,
    message: "Feedback added successfully",
    data: {
      project: updatedProject,
      feedback: latestFeedback,
    },
  });
});


export const getFiles = asyncHandler(async (req, res, next) => {
  const teacherId = req.user._id;

  const projects =
    await projectServices.getProjectsBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...(file.toObject ? file.toObject() : file),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    }))
  );

  res.status(200).json({
    success: true,
    message: "Files fetched successfully",
    data: {
      files: allFiles,
    },
  });
});


export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== supervisorId.toString()) {
    return next(
      new ErrorHandler("Not authorized to download file", 403)
    );
  }

  const file = project.files?.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  await fileServices.streamDownload(
    file.fileUrl,
    res,
    file.originalName
  );
});
