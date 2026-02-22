import {asyncHandler} from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// Register New User Controller
export const registerUser = asyncHandler(async (req, res, next) => {

  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  user = await User.create({
    name,
    email,
    password,
    role,
    department   
  });

  generateToken(user, 201, "User registered successfully", res);
});





// Login User Controller
export const login = asyncHandler(async (req, res, next) => {

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const user = await User.findOne({ email, role }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email, password, or role", 401));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email, password, or role", 401));
    }

    generateToken(user, 200, "Logged in successfully", res);
});



// Logout User Controller
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,     
    sameSite: "None",  
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};




// Get Logged-in User Controller
export const getUser = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user._id)
    .populate("supervisor", "name email")         
    .populate("assignedStudents", "name email");  

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});



// Forgot Password Controller
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


// Reset Password Controller
export const resetPassword = asyncHandler(async (req, res, next) => {

  const { token, password, confirmPassword } = req.body;

  if (!token) {
    return next(new ErrorHandler("Token missing", 400));
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset link", 400));
  }

  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Password fields missing", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

