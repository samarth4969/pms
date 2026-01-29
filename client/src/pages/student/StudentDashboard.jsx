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
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {authUser?.name || "Student"}
          </h1>
          <p className="text-blue-100 text-sm">
            Here’s a quick overview of your project progress and updates
          </p>
        </div>

        {/* Quick Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Project Title */}
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 mb-1">Project Title</p>
    <p className="text-lg font-semibold text-slate-800 truncate">
      {project?.title || "N/A"}
    </p>
  </div>

  {/* Supervisor */}
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 mb-1">Supervisor</p>
    <p className="text-lg font-semibold text-slate-800 truncate">
      {dashboardStats?.supervisorName || "Not Assigned"}
    </p>
  </div>

  {/* Next Deadline */}
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 mb-1">Next Deadline</p>
    <p className="text-lg font-semibold text-slate-800">
      {formatDate(project?.deadline)}
    </p>
  </div>

  {/* ✅ Recent Feedback (TITLE + DATE) */}
  <div className="bg-white rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 mb-1">Recent Feedback</p>

    {feedbackList.length > 0 ? (
      <>
        

        <p className="text-lg font-semibold text-slate-800">
          {formatDate(feedbackList[0]?.createdAt)}
        </p>
      </>
    ) : (
      <p className="text-lg font-semibold text-slate-400">
        No feedback
      </p>
    )}
  </div>
</div>


        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Project Overview
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

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  project?.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : project?.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : project?.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Latest Feedback
              </h2>
              <Link
                to="/student/feedback"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>

            {feedbackList.length > 0 ? (
              <div className="space-y-3">
                {feedbackList.map((feedback, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
              <div className="text-center py-10">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No feedback available yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Deadlines & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Upcoming Deadlines
            </h2>

            {upcomingDeadline.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadline.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{d.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDate(d.deadline)}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                      Upcoming
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <MessageCircleWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No upcoming deadlines
                </p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recent Notifications
            </h2>

            {topNotifications.length > 0 ? (
              <div className="space-y-3">
                {topNotifications.map((n, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-lg border"
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
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No notifications yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
