import { asyncHandler } from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import  {User}  from "../models/user.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";


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

  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have a project proposal under review or approved",
        400
      )
    );
  }

  const project = await projectServices.createProject({
    student: studentId,
    title,
    description,
  });

  await User.findByIdAndUpdate(studentId, { project: project._id });

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

    if(!project || project.student.toString() !== studentId.toString()){
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

export const getSupervisor=asyncHandler(async(req,res,next)=>{
    const studentId=req.user._id;
    const student=await User.findById(studentId).populate("supervisor","name email department experties");
    if(!student.supervisor){
        return res.status(200).json({
            success:true,
            data:{supervisor:null},
            message:"No supervisor assigned yet",
    });
    }
    res.status(200).json({
        success:true,
        data:{supervisor:student.supervisor},
    })
})


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