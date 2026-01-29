import mongoose from "mongoose";

const feedbackSchema=new mongoose.Schema(
{
        supervisorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Supervisor ID is required"],
        },
        type: {
          type: String,
          enum: ["positive", "negative", "general"],
          default: "general",
        },
        title: {
          type: String,
          required: [true, "Feedback title is required"],
          trim: true,
        },
        message: {
          type: String,
          required: [true, "Feedback message is required"],
          trim: true,
          maxlength: [1000, "Feedback message cannot exceed 1000 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },{timestamps:true}
)

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Project title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [1000, "Project description cannot exceed 1000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },

    files: [
      {
        fileType: {
          type: String,
          required: [true, "File type is required"],
        },
        fileUrl: {
          type: String,
          required: [true, "File URL is required"],
        },
        originalName: {
          type: String,
          required: [true, "Original file name is required"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    feedback: [
      feedbackSchema
    ],
    deadline:{
        type: Date,
    }
  },
  {
    timestamps: true,
  }
);

//Indexing for faster queries performance
projectSchema.index({ student: 1 });
projectSchema.index({ supervisor: 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.models.Project||mongoose.model("Project", projectSchema);

export default Project;
