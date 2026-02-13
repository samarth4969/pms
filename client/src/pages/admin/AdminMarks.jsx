import { useEffect, useState } from "react";
import axios from "axios";
console.log("Admin Marks Page Loaded");



const AdminAddMarks = () => {
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});

  // 🔥 Fetch students who have supervisor
  useEffect(() => {
    console.log("Fetching students...");

    const fetchStudents = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/admin/review-students",
          { withCredentials: true }
        );
        
        setStudents(data.students || []);

// ✅ Prefill marks from DB
const initialMarks = {};

(data.students || []).forEach((student) => {
  if (student.review) {
    initialMarks[student._id] = {
      review1: student.review.review1?.obtained || "",
      review2: student.review.review2?.obtained || "",
      review3: student.review.review3?.obtained || "",
    };
  }
});

setMarksData(initialMarks);

        
      } catch (error) {
        console.log(error);
        setStudents([]);
      }
    };
  
    fetchStudents();
  }, []);
  

  // Handle input change per student
  const handleChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Save marks per student
  const handleSave = async (studentId) => {
    const studentMarks = marksData[studentId];

    if (!studentMarks) {
      alert("Enter marks first");
      return;
    }

    try {
      await axios.post(
       `http://localhost:4000/api/v1/admin/add-or-update-marks/${studentId}`,
        {
          review1: { obtained: Number(studentMarks.review1 || 0) },
          review2: { obtained: Number(studentMarks.review2 || 0) },
          review3: { obtained: Number(studentMarks.review3 || 0) },
        },
        { withCredentials: true }
      );

      alert("Marks Saved Successfully");
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">
        Add / Update Review Marks
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Project</th>
              <th className="p-2 border">Supervisor</th>
              <th className="p-2 border">Review 1 (30)</th>
              <th className="p-2 border">Review 2 (30)</th>
              <th className="p-2 border">Review 3 (40)</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="text-center">
                <td className="p-2 border">
                  {student.name}
                </td>

                <td className="p-2 border">
                  {student.project?.title || "No Project"}
                </td>

                <td className="p-2 border">
                  {student.supervisor?.name}
                </td>

                <td className="p-2 border">
                <input
  type="number"
  min="0"
  max="30"
  className="border p-1 w-20"
  value={marksData[student._id]?.review1 || ""}
  onChange={(e) => {
    let value = Number(e.target.value);

    if (value > 30) value = 30;
    if (value < 0) value = 0;

    handleChange(student._id, "review1", value);
  }}
/>


                </td>

                <td className="p-2 border">
                <input
  type="number"
  min="0"
  max="30"
  className="border p-1 w-20"
  value={marksData[student._id]?.review2 || ""}
  onChange={(e) => {
    let value = Number(e.target.value);

    if (value > 30) value = 30;
    if (value < 0) value = 0;

    handleChange(student._id, "review2", value);
  }}
/>

                </td>

                <td className="p-2 border">
                <input
  type="number"
  min="0"
  max="40"
  className="border p-1 w-20"
  value={marksData[student._id]?.review3 || ""}
  onChange={(e) => {
    let value = Number(e.target.value);

    if (value > 40) value = 40;
    if (value < 0) value = 0;

    handleChange(student._id, "review3", value);
  }}
/>

                </td>

                <td className="p-2 border">
                  <button
                    onClick={() => handleSave(student._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAddMarks;
