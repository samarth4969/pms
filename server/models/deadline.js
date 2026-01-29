import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
          type: String,
          required: [true, "Deadline title is required"],
          trim: true,
          maxlength: [100, "deadline message cannot exceed 100 characters"],
        },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      required: [true, "Created by is required"],
    },
    
    Project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default:null,
    },
    
    
    
  },
  {
    timestamps: true,
  }
);

//Indexing for faster queries performance
deadlineSchema.index({  dueDate:1 });
deadlineSchema.index({  Project:1 });
deadlineSchema.index({  createdBy:1 });

const Deadline = mongoose.models.Deadline||mongoose.model("Deadline", deadlineSchema);

export default Deadline;