import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserID is required"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "request",
        "approval",
        "rejection",
        "feedback",
        "deadline",
        "general",
        "system",
      ],
      default: "general",
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
  },
  { timestamps: true }
);

// ✅ index
notificationSchema.index({ user: 1, isRead: 1 });

// ✅ NAMED EXPORT (MATCHES YOUR IMPORT)
export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
