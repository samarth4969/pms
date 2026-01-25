import { supervisorRequest } from "../models/supervisorRequest.js";
import { ErrorHandler } from "../middlewares/error.js";
import Project from "../models/project.js";

/* ================= CREATE REQUEST ================= */

export const createRequest = async (requestData) => {
  const existingRequest = await supervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (existingRequest) {
    throw new ErrorHandler(
      "You have already sent a request to this supervisor. Please wait for their response.",
      400
    );
  }

  return await supervisorRequest.create(requestData);
};

/* ================= GET ALL REQUESTS ================= */

export const getAllRequests = async (filters) => {
  const requests = await supervisorRequest
    .find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await supervisorRequest.countDocuments(filters);
  return { requests, total };
};

/* ================= ACCEPT REQUEST ================= */

export const acceptRequest = async (requestId, teacherId) => {
  // 1️⃣ Find request
  const request = await supervisorRequest
    .findById(requestId)
    .populate("student", "_id");

  if (!request) {
    throw new ErrorHandler("Request not found", 404);
  }

  if (request.status !== "pending") {
    throw new ErrorHandler("Request already processed", 400);
  }

  // 2️⃣ Find student's latest project
  const project = await Project.findOne({ student: request.student._id })
    .sort({ createdAt: -1 });

  if (!project) {
    throw new ErrorHandler("Student project not found", 404);
  }

  if (project.supervisor) {
    throw new ErrorHandler("Supervisor already assigned", 400);
  }

  // 3️⃣ ASSIGN SUPERVISOR (THIS WAS MISSING ❌)
  project.supervisor = teacherId;
  await project.save();

  // 4️⃣ Update request
  request.supervisor = teacherId;
  request.status = "accepted";
  await request.save();

  return request;
};

/* ================= REJECT REQUEST ================= */

export const rejectRequest = async (requestId, teacherId) => {
  const request = await supervisorRequest
    .findById(requestId)
    .populate("student", "name email");

  if (!request) {
    throw new ErrorHandler("Request not found", 404);
  }

  if (request.status !== "pending") {
    throw new ErrorHandler("Request already processed", 400);
  }

  // ✅ Assign teacher for audit (optional but safe)
  request.supervisor = teacherId;
  request.status = "rejected";

  await request.save();
  return request;
};

