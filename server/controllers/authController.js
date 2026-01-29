import {asyncHandler} from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// Register user
export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }   

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User already exists", 400));
    }

    user = new User({
        name,
        email,
        password,
        role,
    });

    await user.save();

    generateToken(user,201,"User registered successfully",res);
});

export const login =asyncHandler(async(req,res,next)=>{
    const {email,password,role}=req.body;
    if(!email||!password||!role){
        return next(new ErrorHandler("Please provide all required fields",400));
    }
    const user=await User.findOne({email,role}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid password, email, role",401));
    }
    const isPasswordMatch=await user.comparePassword(password);

    if(!isPasswordMatch){
        return next(new ErrorHandler("Invalid password, email, role",401));
    }

    generateToken(user,200,"Logged in successfully",res);
});


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/", // ✅ MUST MATCH LOGIN
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};






export const getUser =asyncHandler(async(req,res,next)=>{
    const user=req.user;
    res.status(200).json({
        success:true,
        user,
    })
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl =
        `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            to: user.email,
            subject: "FYP System - Password reset request",
            message,
        });

        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(
            new ErrorHandler(error.message || "Cannot send email", 500)
        );
    }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  console.log("========== RESET PASSWORD HIT ==========");
  console.log("REQ BODY:", req.body);

  const { token, password, confirmPassword } = req.body;

  if (!token) {
    console.log("❌ TOKEN IS MISSING");
    return next(new ErrorHandler("Token missing", 400));
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  console.log("HASHED TOKEN:", resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log("USER FOUND:", user);

  if (!user) {
    console.log("❌ USER NOT FOUND WITH THIS TOKEN");
    return next(new ErrorHandler("Invalid or expired reset link", 400));
  }

  console.log("PASSWORD:", password);
  console.log("CONFIRM PASSWORD:", confirmPassword);

  if (!password || !confirmPassword) {
    console.log("❌ PASSWORD FIELDS MISSING");
    return next(new ErrorHandler("Password fields missing", 400));
  }

  if (password !== confirmPassword) {
    console.log("❌ PASSWORDS DO NOT MATCH");
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  console.log("✅ PASSWORD UPDATED SUCCESSFULLY");
  console.log("=======================================");

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});
