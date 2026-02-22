import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto"; //used to generate secure random tokens (for reset password)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      MaxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // email format validation
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // password will NOT be returned in queries
      MinLength: [8, "Password must be alteast 8 character long"],
    },
    role: {
      type: String,
      default: "Student",
      enum: ["Student", "Teacher", "Admin"],
    },

    // Fields used for forgot password feature
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    department: {
      type: String,
      required: true,
      enum: [
        "CS",
        "IT",
        "ENTC",
        "AIDS",
        "ANR",
        "Instru",
        "Electrical",
        "Mech",
        "Civil",
      ],
    },

    experties: {
      type: [String],

      default: [],
    },
    maxStudents: {
      type: Number,
      default: 10,
      min: [1, "Min student must be atleast 1"],
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId, // reference to User collection
        ref: "User",
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);


// This runs automatically before saving a user
userSchema.pre("save", async function () {
  // If password is not modified, don't hash again
  if (!this.isModified("password")) {
    return;
  }

   // Hash password with salt rounds = 10
  this.password = await bcrypt.hash(this.password, 10);
});

// METHOD: Generate JWT Token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// METHOD: Compare Entered Password with Hashed Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// METHOD: Check if teacher has capacity to take more students
userSchema.methods.hasCapacity = function () {
  if (this.role !== "Teacher") {
    return false;
  }
  return this.assignedStudents.length < this.maxStudents;
};

// METHOD: Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


export const User = mongoose.model("User", userSchema);
