import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ErrorHandler } from "../middlewares/error.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectServices.js";
import * as notificationServices from "../services/notificationServices.js";

import { User } from "../models/user.js";
import Project from "../models/project.js";
import {supervisorRequest}  from "../models/supervisorRequest.js";
// import {User} from

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfullt",
    data: { user },
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  if (user.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 404));
  }
  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, experties } =
    req.body;

  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !experties
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const parsedExperties = Array.isArray(experties)
    ? experties
    : typeof experties === "string"
      ? experties.split(",").map((s) => s.trim())
      : [];

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents,
    experties: parsedExperties,
    role: "Teacher",
  });

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  if (user.role !== "Teacher") {
    return next(new ErrorHandler("User is not a teacher", 404));
  }
  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.allUsers();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

export const getAllProjectsController = asyncHandler(async (req, res) => {
  const projects = await projectServices.getAllProjects();

  res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: { projects },
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalTeachers,
    totalProjects,
    pendingRequests,
    completedProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    supervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "pending" }),
  ]);

  res.status(200).json({
    success: true,
    message: "Admin Dashboard fetched",
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingRequests,
        completedProjects,
        pendingProjects,
      },
    },
  });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { projectId, supervisorId } = req.body;

  if (!projectId || !supervisorId) {
    return next(
      new ErrorHandler("ProjectId and SupervisorId are required", 400)
    );
  }

  // 1️⃣ Find project and populate student
  const project = await Project.findById(projectId).populate("student");

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  // 2️⃣ Prevent reassignment
  if (project.supervisor) {
    return next(new ErrorHandler("Supervisor already assigned", 400));
  }

  // 3️⃣ Project must be approved
  if (project.status !== "approved") {
    return next(
      new ErrorHandler(
        "Project must be approved before assigning supervisor",
        400
      )
    );
  }

  // 4️⃣ Assign supervisor to PROJECT
  project.supervisor = supervisorId;
  await project.save();

  // 5️⃣ Assign supervisor to STUDENT (🔥 CRITICAL FIX)
  if (project.student) {
    // ✅ Update student document
    await User.findByIdAndUpdate(
      project.student._id,
      { supervisor: supervisorId },
      { new: true }
    );

    // ✅ Update teacher assigned students
    await User.findByIdAndUpdate(
      supervisorId,
      { $addToSet: { assignedStudents: project.student._id } },
      { new: true }
    );

    // 🔔 Notify student
    await notificationServices.notifyUser(
      project.student._id,
      "You have been assigned a supervisor",
      "approval",
      "/student/dashboard",
      "low"
    );
  }

  // 🔔 Notify teacher
  await notificationServices.notifyUser(
    supervisorId,
    "You have been assigned a new student project",
    "general",
    "/teacher/dashboard",
    "low"
  );

  res.status(200).json({
    success: true,
    message: "Supervisor assigned successfully",
    data: {
      projectId: project._id,
      supervisorId,
      studentId: project.student?._id,
    },
  });
});




export const getProject=asyncHandler(async(req,res,next)=>{
  const {id}=req.params;
  const project=await projectServices.getProjectById(id);

  if(!project){
    return next(new ErrorHandler("Project not found",404));
  }
  const user=req.user;
  const userRole=(user.role||"").toLowerCase();
  const userId=user._id?.toString()||user.id;
  const hasAccess=
    userRole==="admin"||
    project.student._id.toString()===userId||
    (project.supervisor&&project.supervisor._id.toString()===userId);

    if(!hasAccess){
      return next(new ErrorHandler("Access denied",403));
    }

  res.status(200).json({
    success:true,
    message:"Project fetched successfully",
    data:{project},
  }); 

})

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  const project = await projectServices.getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === "admin" ||
    (project.supervisor &&
      project.supervisor._id.toString() === userId);

  if (!hasAccess) {
    return next(new ErrorHandler("Access denied", 403));
  }

  if (!["approved", "rejected", "completed", "pending"].includes(status)) {
    return next(new ErrorHandler("Invalid project status", 400));
  }

  if (project.status === status) {
    return next(
      new ErrorHandler(`Project already ${status}`, 400)
    );
  }

  const updatedProject = await projectServices.updateProject(id, { status });

  return res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: { project: updatedProject },
  });
});


export const searchStudents = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
          role: "Student",
        }
      : { role: "Student" };

    const students = await User.find(keyword).select("name email");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Review from "../models/reviewModel.js";

export const getStudentsForReview = asyncHandler(async (req, res) => {
  const students = await User.find({
    role: "Student",
    supervisor: { $ne: null },
  })
    .select("name email supervisor project")
    .populate("supervisor", "name");

  const formattedStudents = await Promise.all(
    students.map(async (student) => {
      const project = await Project.findOne({
        student: student._id,
      }).select("title status");

      const review = await Review.findOne({
        student: student._id,
      });

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        supervisor: student.supervisor,
        project: project || null,
        review: review || null,   // 🔥 ADD THIS
      };
    })
  );

  res.status(200).json({
    success: true,
    students: formattedStudents,
  });
});

