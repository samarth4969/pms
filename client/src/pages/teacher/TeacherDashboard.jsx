import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
import { CheckCircle, Clock, Loader, MoveDiagonal, Users } from "lucide-react";

const TeacherDashboard = () => {

  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
  if (authUser?._id) {
    dispatch(getTeacherDashboardStats());
  }
}, [dispatch, authUser?._id]);


  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudents || 0,
      loading,
      Icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      Icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      Icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  return (
  <>
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {authUser?.name}
        </h1>
        <p className="text-green-100 text-sm">
          Manage your students and guide their projects efficiently.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map(({ title, value, loading, Icon, bg, color }, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  {title}
                </p>
                <p className="text-2xl font-semibold text-slate-800">
                  {loading ? "..." : value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Activity
          </h2>
          <p className="text-sm text-slate-500">
            Latest updates and notifications
          </p>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader className="animate-spin text-slate-500" size={32} />
            </div>
          ) : dashboardStats?.recentNotifications?.length > 0 ? (
            dashboardStats.recentNotifications.map((notification) => (
              <div
                key={notification._id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MoveDiagonal className="w-5 h-5 text-slate-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-800">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No recent activity
            </div>
          )}
        </div>

      </div>

    </div>
  </>
);

};

export default TeacherDashboard;
