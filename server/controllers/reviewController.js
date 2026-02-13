import Review from "../models/reviewModel.js";

// Admin add or update marks
export const addOrUpdateMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { review1, review2, review3 } = req.body;

    // Calculate total obtained
    const totalObtained =
      review1.obtained +
      review2.obtained +
      review3.obtained;

    const percentage = (totalObtained / 100) * 100;

    let review = await Review.findOne({ student: studentId });

    if (review) {
      // Update existing
      review.review1 = review1;
      review.review2 = review2;
      review.review3 = review3;
      review.totalObtained = totalObtained;
      review.percentage = percentage;

      await review.save();
    } else {
      // Create new
      review = await Review.create({
        student: studentId,
        review1,
        review2,
        review3,
        totalObtained,
        percentage,
      });
    }

    res.status(200).json({
      success: true,
      message: "Marks saved successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


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
  