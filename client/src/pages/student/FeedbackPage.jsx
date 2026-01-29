import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  const feedback = project?.feedback || [];

  const getFeedbackIcon = (type) => {
    if (type === "positive") {
      return <BadgeCheck className="w-6 h-6 text-green-500" />;
    }
    if (type === "negative") {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
    return <MessageCircle className="w-6 h-6 text-blue-500" />;
  };

  const feedbackStats = [
    {
      title: "Total Feedback",
      bg: "bg-blue-50",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      value: feedback.length,
    },
    {
      title: "Positive",
      bg: "bg-green-50",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      value: feedback.filter((f) => f.type === "positive").length,
    },
    {
      title: "Needs Revision",
      bg: "bg-yellow-50",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      value: feedback.filter((f) => f.type === "negative").length,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Supervisor Feedback</h1>
            <p className="card-subtitle">
              View feedback and comments from your supervisor
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbackStats.map((item, i) => (
            <div key={i} className={`${item.bg} rounded-lg p-4`}>
              <p className={`text-sm ${item.textColor}`}>{item.title}</p>
              <p className={`text-2xl font-bold ${item.valueColor}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length > 0 ? (
            feedback.map((f, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  {getFeedbackIcon(f.type)}
                  <h3 className="font-medium text-slate-800">
                    {f.title || "Feedback"}
                  </h3>
                </div>

                <p className="text-sm text-slate-500 mb-2">
  {new Date(f.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>


                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-700">{f.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No feedback received yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
