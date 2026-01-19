import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "StudentID is required"],
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "SupervisorID is required"],
    },

    message: {
      type: String,
      trim: true,
      maxLength: [1000, "Message cannot exceed 1000 characters"],
      required: [true, "Message is required"],
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ index is fine
supervisorRequestSchema.index({ student: 1, supervisor: 1, status: 1 });

// ✅ DEFINE ONCE, EXPORT ONCE (NAMED EXPORT)
export const supervisorRequest =
  mongoose.models.SupervisorRequest ||
  mongoose.model("SupervisorRequest", supervisorRequestSchema);
