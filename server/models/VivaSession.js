import mongoose from "mongoose";

const vivaSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    questions: [
      {
        type: String,
      },
    ],

    answers: [
      {
        question: String,
        answer: String,
        feedback: String,   // AI feedback
        score: {
          type: Number,
          default: 0,
          min: 0,
          max: 10,
        },
        
      },
    ],


    totalScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const VivaSession = mongoose.model("VivaSession", vivaSessionSchema);

export default VivaSession;
