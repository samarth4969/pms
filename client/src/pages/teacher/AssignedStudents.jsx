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
  const {
    assignedStudents = [],
    loading,
    error,
  } = useSelector((state) => state.teacher);

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
      }),
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
      <div className="text-center text-red-600 font-medium py-10">{error}</div>
    );
  }

 return (
  <>
  <div className="space-y-10">

    {/* HEADER */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-slate-800">
        Assigned Students
      </h1>
      <p className="text-slate-500 text-sm mt-2">
        Monitor progress, provide feedback and complete projects.
      </p>
    </div>

    {/* STUDENTS */}
    {assignedStudents.length === 0 ? (
      <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
        <p className="text-slate-500">No students assigned yet.</p>
      </div>
    ) : (
      <div className="grid gap-6">
        {assignedStudents.map((student) => (
          <div
            key={student._id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* LEFT INFO */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {student.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {student.email}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">
                    {student.project?.title || "No project title"}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Last Updated:{" "}
                    {student.project?.updatedAt
                      ? new Date(
                          student.project.updatedAt
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-4">

                {/* STATUS BADGE */}
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    student.project?.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : student.project?.status === "approved"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {student.project?.status || "pending"}
                </span>

                {/* FEEDBACK BUTTON */}
                <button
                  onClick={() => handleFeedback(student)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-700 transition"
                >
                  Give Feedback
                </button>

                {/* COMPLETE BUTTON */}
                {student.project?.status !== "completed" && (
                  <button
                    onClick={() => handleMarkComplete(student)}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition"
                  >
                    Complete
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 relative">

        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Feedback for {selectedStudent.name}
        </h2>

        <div className="space-y-4">

          <input
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none"
            placeholder="Feedback title"
            value={feedbackData.title}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, title: e.target.value })
            }
          />

          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none"
            placeholder="Write detailed feedback..."
            value={feedbackData.message}
            onChange={(e) =>
              setFeedbackData({ ...feedbackData, message: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="px-4 py-2 border border-slate-300 rounded-xl"
              value={feedbackData.type}
              onChange={(e) =>
                setFeedbackData({ ...feedbackData, type: e.target.value })
              }
            >
              <option value="general">General</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>

            <select
              className="px-4 py-2 border border-slate-300 rounded-xl"
              value={feedbackData.priority}
              onChange={(e) =>
                setFeedbackData({ ...feedbackData, priority: e.target.value })
              }
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <button
            onClick={submitFeedback}
            disabled={!feedbackData.title.trim() || !feedbackData.message.trim()}
            className={`w-full py-2 rounded-xl text-white font-medium transition ${
              !feedbackData.title.trim() || !feedbackData.message.trim()
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-700"
            }`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ================= COMPLETE MODAL ================= */}
  {showCompleteModal && selectedStudent && (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          Mark project as complete?
        </h3>

        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={confirmMarkComplete}
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )}
</>

 )

};

export default AssignedStudents;
