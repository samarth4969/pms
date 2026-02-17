import {asyncHandler} from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import  {User}  from "../models/user.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import * as fileServices from "../services/fileServices.js";
import {Notification} from "../models/notification.js"
import Project from "../models/project.js"


export const getStudentProject= asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const project=await projectServices.getProjectByStudentId(studentId);

    if(!project){
        return res.status(200).json({
            success:true,
            data:{project:null},
            message:"No project found for this student"
        });
    }
    res.status(200).json({
        success:true,
        data:{project},
        message:"Project fetched successfully"
    });

})
    

export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  if (!title || !description) {
    return next(new ErrorHandler("Title and description are required", 400));
  }

  const existingProject =
    await projectServices.getProjectByStudentId(studentId);

  // ✅ Case 1: project exists and NOT rejected
  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have a project proposal under review or approved",
        400
      )
    );
  }

  // ✅ Case 2: project exists AND rejected
  if (existingProject && existingProject.status === "rejected") {
    await Project.findByIdAndDelete(existingProject._id);
  }

  // ✅ Case 3: no project OR rejected project deleted
  const project = await projectServices.createProject({
    student: studentId,
    title,
    description,
    department: req.user.department, // important
  });

  await User.findByIdAndUpdate(studentId, {
    project: project._id,
  });

  res.status(201).json({
    success: true,
    data: { project },
    message: "Project proposal submitted successfully",
  });
});


    

export const uploadFiles=asyncHandler(async (req, res, next) => {
    const {projectId}=req.params;
    const studentId = req.user._id;
    const project=await projectServices.getProjectById(projectId);

    if(!project || project.student._id.toString() !== studentId.toString() || project.status==="rejected"){
        return next(new ErrorHandler("Project not found or you are not authorized to upload files for this project.", 404));
    }

    if(!req.files || req.files.length===0){
        return next(new ErrorHandler("No files uploaded.", 400));
    }
    const updatedProject=await projectServices.addFilesToProject(projectId, req.files);

    res.status(200).json({
        success:true,
        data:{project:updatedProject},
        message:"Files uploaded successfully"
    });
})


export const getAvailableSupervisors=asyncHandler(async (req, res, next) => {
    const supervisors=await User.find({role:"Teacher"}).select("name email department experties").lean();

    res.status(200).json({
        success:true,
        data:{supervisors},
        message:"Available supervisors fetched successfully"
    });
})



export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .populate("supervisor", "name email department experties");

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found for this student",
    });
  }

  if (!project.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  res.status(200).json({
    success: true,
    data: { supervisor: project.supervisor },
  });
});




export const requestSupervisor=asyncHandler(async(req,res,next)=>{
    const {teacherId,message}=req.body;
    const studentId=req.user._id;

    const student=await User.findById(studentId);
    if(student.supervisor){
        return next(new ErrorHandler("You already have a supervisor already",400));
    }
    const supervisor=await User.findById(teacherId);
    if(!supervisor|| supervisor.role!="Teacher"){
        return next(new ErrorHandler("Invalid supervisor selected",400));
    }

    if (supervisor.assignedStudents.length >= supervisor.maxStudents) {
  return next(
    new ErrorHandler("Selected teacher has reached max student capacity", 400)
  );
}


    const requestData={
        student:studentId,
        supervisor:teacherId,
        message,
    };

    const request=await requestServices.createRequest(requestData);
    await notificationServices.notifyUser(
        teacherId,
        `${student.name} has requested ${supervisor.name} to be their supervisor`,
        "request",
        "teacher/requests",
        "medium",
    )
    res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request sent successfully",
  });

})

export const getDashBoardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  // Latest project
  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();

  const now = new Date();

  // Upcoming deadlines
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("title description deadline")
    .sort({ deadline: 1 })
    .limit(3)
    .lean();

  // Top notifications
  const topNotifications = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // Latest feedback notifications
  const feedBackNotifications =
    project?.feedback?.length > 0
      ? project.feedback
          .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          .slice(0, 2)
      : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadline:upcomingDeadlines,
      topNotifications,
      feedBackNotifications,
      supervisorName,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler(
        "Not authorized to view feedback for this project",
        403
      )
    );
  }

  const sortedFeedback = [...project.feedback].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  ).map((f)=>({
    _id:f._id,
    title:f.title,
    message:f.message,
    type:f.type,
    createdAt:f.createdAt,
    supervisorName:f.supervisorId?.name,
    supervisorEmail:f.supervisorId?.email,
  }))

  res.status(200).json({
    success: true,
    data: {
      feedback: sortedFeedback,
    },
  });
});


export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.student._id.toString() !== studentId.toString()) {
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