import { asyncHandler } from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userService.js";

export const createStudent=asyncHandler(async(req,res,next)=>{
    const {name,email,password,department}=req.body;
    if(!name || !email || !password ||!department){
        return next(new ErrorHandler("Please provide all required fields",400));
    }

    const user=await userServices.createUser({name,email,password,department,role:"Student"});
    res.status(201).json({
        success:true,
        message:"Student created successfullt",
        data:{user},
    })
})

export const updateStudent=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const updateData={...req.body};
    delete updateData.role;

    const user=await userServices.updateUser(id,updateData);
    if(!user){
        return next(new ErrorHandler("Student not found",404));

    }
    res.status(200).json({
        success:true,
        message:"Student updated successfully",
        data:{user},
    })
})

export const deleteStudent=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const user=await userServices.getUserById(id);
    if(!user){
        return next(new ErrorHandler("Student not found",404));
    }
    if(user.role!=="Student"){
        return next(new ErrorHandler("User is not a student",404));
    }
    await userServices.deleteUser(id);
    res.status(200).json({
        success:true,
        message:"Student deleted successfully",
    })
})

export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, experties } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !experties
  ) {
    return next(
      new ErrorHandler("Please provide all required fields", 400)
    );
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

export const assignSupervisor= asyncHandler(async (req, res, next) => {})
export const getAllProject= asyncHandler(async (req, res, next) => {})
export const getDashboardStats= asyncHandler(async (req, res, next) => {})

