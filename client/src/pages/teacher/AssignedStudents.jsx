import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, MessageSquare, CheckCircle } from "lucide-react";
import {
  getAssignedStudents,
  addFeedback,
  markComplete,
} from "../../store/slices/teacherSlice";

const AssignedStudents = () => {
  const dispatch = useDispatch();
  const { assignedStudents = [], loading, error } = useSelector(
    (state) => state.teacher
  );

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
    
  priority: "medium", // ✅ ADD THIS
  });

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  /* ================= HELPERS ================= */

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";
      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

 const closeModal = () => {
  setShowFeedbackModal(false);
  setShowCompleteModal(false);
  setSelectedStudent(null);
  setFeedbackData({
    title: "",
    message: "",
    type: "general",
    priority: "medium", // ✅ MUST KEEP THIS
  });
};


  /* ================= ACTIONS ================= */

  const handleFeedback = (student) => {
    setSelectedStudent(student);
    setShowFeedbackModal(true);
  };

  const submitFeedback = () => {
    if (!selectedStudent?.project?._id) return;

    if (!feedbackData.title.trim() || !feedbackData.message.trim()) {
      alert("Please fill in all feedback details");
      return;
    }

    dispatch(
      addFeedback({
        projectId: selectedStudent.project._id,
        payload: feedbackData,
      })
    );

    closeModal();
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const confirmMarkComplete = () => {
    if (!selectedStudent?.project?._id) return;

    dispatch(markComplete(selectedStudent.project._id));
    closeModal();
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-medium py-10">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* ================= MAIN CONTENT ================= */}
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assigned Students</h1>
            <p className="card-subtitle">
              Manage your assigned students and their projects
            </p>
          </div>
        </div>

        {/* Students List */}
        {assignedStudents.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-600">No students assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedStudents.map((student) => (
              <div key={student._id} className="card">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Student Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {student.name}
                    </h3>
                    <p className="text-sm text-slate-600">{student.email}</p>
                    <p className="mt-2 font-medium text-slate-700">
                      {student.project?.title || "No project title"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        student.project?.status
                      )}`}
                    >
                      {student.project?.status || "pending"}
                    </span>

                    <button
                      onClick={() => handleFeedback(student)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Provide Feedback"
                    >
                      <MessageSquare size={18} />
                    </button>

                    {student.project?.status !== "completed" && (
                      <button
                        onClick={() => handleMarkComplete(student)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                        title="Mark Complete"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FEEDBACK MODAL ================= */}
      {showFeedbackModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg p-6">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Provide Feedback</h2>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm mb-5">
              <p>
                <span className="font-medium">Project:</span>{" "}
                {selectedStudent.project?.title}
              </p>
              <p>
                <span className="font-medium">Student:</span>{" "}
                {selectedStudent.name}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{" "}
                {selectedStudent.project?.updatedAt
                  ? new Date(
                      selectedStudent.project.updatedAt
                    ).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            {/* Form */}
           {/* Title */}
<input
  className="w-full mb-3 px-3 py-2 border rounded-lg"
  placeholder="Feedback title"
  value={feedbackData.title}
  onChange={(e) =>
    setFeedbackData({ ...feedbackData, title: e.target.value })
  }
/>

{/* Message */}
<textarea
  className="w-full mb-3 px-3 py-2 border rounded-lg"
  rows={4}
  placeholder="Write feedback..."
  value={feedbackData.message}
  onChange={(e) =>
    setFeedbackData({ ...feedbackData, message: e.target.value })
  }
/>

{/* Type */}
<select
  className="w-full mb-3 px-3 py-2 border rounded-lg"
  value={feedbackData.type}
  onChange={(e) =>
    setFeedbackData({ ...feedbackData, type: e.target.value })
  }
>
  <option value="general">General</option>
  <option value="positive">Positive</option>
  <option value="negative">Negative</option>
</select>

{/* ⭐ Priority — ADD THIS HERE */}
<select
  className="w-full mb-4 px-3 py-2 border rounded-lg"
  value={feedbackData.priority}
  onChange={(e) =>
    setFeedbackData({ ...feedbackData, priority: e.target.value })
  }
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>


            <button
              onClick={submitFeedback}
              disabled={
                !feedbackData.title.trim() ||
                !feedbackData.message.trim()
              }
              className={`w-full py-2 rounded-lg text-white ${
                !feedbackData.title.trim() ||
                !feedbackData.message.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* ================= MARK COMPLETE MODAL ================= */}
      {showCompleteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Mark project as complete?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignedStudents;
