import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import { MessageCircle, MessageCircleWarning, Bell } from "lucide-react";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const upcomingDeadline = dashboardStats?.upcomingDeadline || [];
  const topNotifications = dashboardStats?.topNotifications || [];

  // ✅ Feedback notifications only
  const feedbackList =
    topNotifications
      ?.filter((n) => n.type === "feedback")
      .slice(0, 2) || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
  <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
    {/* Header */}
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
      <div className="absolute right-0 top-0 opacity-10 text-white text-9xl font-bold pr-6 pt-2">
        🎓
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome back, {authUser?.name || "Student"} 👋
      </h1>
      <p className="text-blue-100 text-sm">
        Track your project progress, feedback, and upcoming deadlines in one place.
      </p>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          label: "Project Title",
          value: project?.title || "N/A",
        },
        {
          label: "Supervisor",
          value: dashboardStats?.supervisorName || "Not Assigned",
        },
        {
          label: "Next Deadline",
          value: formatDate(project?.deadline),
        },
        {
          label: "Recent Feedback",
          value:
            feedbackList.length > 0
              ? formatDate(feedbackList[0]?.createdAt)
              : "No feedback",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            {item.label}
          </p>
          <p className="text-lg font-semibold text-slate-800 truncate">
            {item.value}
          </p>
        </div>
      ))}
    </div>

    {/* Main Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Project Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-3">
          📌 Project Overview
        </h2>

        <div>
          <p className="text-sm text-slate-500">Title</p>
          <p className="text-lg font-medium text-slate-800">
            {project?.title || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Description</p>
          <p className="text-slate-700 leading-relaxed mt-1">
            {project?.description || "N/A"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Status</span>
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize ${
              project?.status === "approved"
                ? "bg-green-100 text-green-700"
                : project?.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : project?.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {project?.status || "Unknown"}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">Submission Deadline</p>
          <p className="font-medium text-slate-800">
            {formatDate(project?.deadline)}
          </p>
        </div>
      </div>

      {/* Latest Feedback */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-slate-800">
            💬 Latest Feedback
          </h2>
          <Link
            to="/student/feedback"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View All
          </Link>
        </div>

        {feedbackList.length > 0 ? (
          <div className="space-y-4">
            {feedbackList.map((feedback, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <p className="font-medium text-slate-800 truncate">
                      {feedback?.title ||
                        feedback?.message ||
                        "Feedback"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(feedback?.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No feedback available yet
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Deadlines & Notifications */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Deadlines */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">
          ⏳ Upcoming Deadlines
        </h2>

        {upcomingDeadline.length > 0 ? (
          <div className="space-y-4">
            {upcomingDeadline.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:shadow-sm transition"
              >
                <div>
                  <p className="font-medium text-slate-800">{d.title}</p>
                  <p className="text-sm text-slate-600">
                    {formatDate(d.deadline)}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800 font-semibold">
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircleWarning className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No upcoming deadlines
            </p>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-5">
          🔔 Recent Notifications
        </h2>

        {topNotifications.length > 0 ? (
          <div className="space-y-4">
            {topNotifications.map((n, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-sm transition"
              >
                <p className="font-medium text-slate-800">
                  {n.message}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(n.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No notifications yet
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

};

export default StudentDashboard;
