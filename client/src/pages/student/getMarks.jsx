import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";

const StudentMarks = () => {
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const { data } = await axiosInstance.get("/student/my-marks");


        setMarks(data.review);
      } catch (error) {
        console.log(error);
        setMarks(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading marks...</div>;

  if (!marks)
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        ⚠ Marks have not been published yet.
      </div>
    );

  const renderReview = (title, review, maxMarks) => {
    if (!review || review.obtained === undefined) {
      return (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-yellow-600">Marks not updated yet</p>
        </div>
      );
    }

    return (
      <div className="bg-white shadow-md p-4 rounded-lg mb-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-lg font-bold">
          {review.obtained} / {maxMarks}
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{
              width: `${(review.obtained / maxMarks) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 px-2 w-full">

      <h2 className="text-2xl font-bold mb-6 text-center">
        📊 My Review Marks
      </h2>

      {renderReview("Review 1", marks.review1, 30)}
      {renderReview("Review 2", marks.review2, 30)}
      {renderReview("Review 3", marks.review3, 40)}

      <div className="bg-green-50 border border-green-300 p-6 rounded-lg mt-6 text-center">
        <h3 className="text-xl font-bold">
          Total: {marks.totalObtained || 0} / 100
        </h3>
        <h3 className="text-lg mt-2">
          Percentage: {marks.percentage || 0}%
        </h3>
      </div>
    </div>
  );
};

export default StudentMarks;
