import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review1: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 30 },
    },
    review2: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 30 },
    },
    review3: {
      obtained: { type: Number, default: 0 },
      total: { type: Number, default: 40 },
    },
    totalObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
    },
  });
  
  export const getMyMarks = async (req, res) => {
  try {
    const review = await Review.findOne({
      student: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Review = mongoose.models.Review||mongoose.model("Review",reviewSchema);
export default Review;
