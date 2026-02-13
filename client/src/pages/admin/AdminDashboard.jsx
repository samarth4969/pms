import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import {
  getAllProjects,
  getDashboardStats,
} from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";
import {
  X,
  User,
  Box,
  AlertCircle,
  Folder,
  AlertTriangle,
  PlusIcon,
  FileTextIcon,
} from "lucide-react";
import {
  toggleStudentModel,
  toggleTeacherModel,
} from "../../store/slices/popupSlice";

const AdminDashboard = () => {
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );
  const { stats, projects } = useSelector((state) => state.admin);
  // const { projects } = useSelector((state) => state.project);
  const notifications = useSelector(
    (state) => state.notification.list,
  );

  const dispatch = useDispatch();



  

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
  dispatch(getNotifications()).then((res) => {
    console.log("✅ Notifications result:", res);
  });

  dispatch(getDashboardStats());
  dispatch(getAllProjects());
}, [dispatch]);


  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (projects || []).filter((p) => {
      if (!p.deadline) {
        return false;
      }
      const d = new Date(p.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.uploadedAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files.filter((f) =>
    (f.originalName || "").toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownload = async (projectId, fileId, name) => {
  const res = await dispatch(downloadProjectFile({ projectId, fileId }));

  if (!res.payload?.blob) {
    toast.error("Failed to download file");
    return;
  }

  const url = window.URL.createObjectURL(new Blob([res.payload.blob]));
  const link = document.createElement("a");

  link.href = url;
  link.download = name || "download";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};


  const supervisorsBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      if (!p?.supervisor?.name) return;
      const name = p.supervisor?.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 6),
    [notifications],
  );

  const getBulletColor = (type, priority) => {
    const t = (type || "").toLowerCase();
    const p = (priority || "").toLowerCase();
    if (p === "high" && (t === "rejection" || t === "reject"))
      return "bg-red-600";
    if (p === "medium" && (t === "deadline" || t === "due"))
      return "bg-orange-500";
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-slate-400";
    // type-based fallback
    if (t === "approval" || t === "approved") return "bg-green-600";
    if (t === "request") return "bg-blue-600";
    if (t === "feedback") return "bg-purple-600";
    if (t === "meeting") return "bg-cyan-600";
    if (t === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const v = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(v)) return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(v))
        return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(v))
        return "bg-orange-100 text-orange-800";
      if (v === "request") return "bg-blue-100 text-blue-800";
      if (v === "feedback") return "bg-purple-100 text-purple-800";
      if (v === "meeting") return "bg-cyan-100 text-cyan-800";
      if (v === "system") return "bg-slate-100 text-slate-800";
      return "bg-gray-100 text-gray-800";
    }
    // priority
    if (v === "high") return "bg-red-100 text-red-800";
    if (v === "medium") return "bg-yellow-100 text-yellow-800";
    if (v === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: Box,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Folder,
    },
    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      bg: "bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModel()),
      btnClass: "btn-primary",
      Icon: PlusIcon, // lucide-react icon
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModel()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      btnClass: "btn-outline",
      Icon: FileTextIcon,
    },
  ];

 return(
  <>
  <div className="space-y-8">

    {/* HEADER */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-white">
        Admin Dashboard
      </h1>
      <p className="text-indigo-100 mt-2">
        Manage projects, students, teachers and system activities
      </p>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {dashboardStats.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {item.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${item.iconBg}`}>
              <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* CHART + NOTIFICATIONS */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Project Distribution by Supervisor
          </h3>
        </div>

        <div className="p-6">
          {supervisorsBucket.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No data available
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supervisorsBucket}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} height={50} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {supervisorsBucket.map((_, i) => (
                      <Cell
                        key={i}
                        fill={["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"][i % 4]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Activity
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {latestNotifications.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No recent notifications
            </p>
          ) : (
            latestNotifications.map((n) => (
              <div key={n._id} className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 mt-2 rounded-full ${getBulletColor(
                    n.type,
                    n.priority
                  )}`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {n.message}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getBadgeClasses(
                        "type",
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getBadgeClasses(
                        "priority",
                        n.priority
                      )}`}
                    >
                      {n.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* QUICK ACTIONS */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actionButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition text-sm font-medium"
          >
            <btn.Icon className="w-5 h-5" />
            {btn.label}
          </button>
        ))}
      </div>
    </div>

    {/* REPORT MODAL */}
    {isReportModalOpen && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              All Project Files
            </h3>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <X />
            </button>
          </div>

          <input
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-6"
            placeholder="Search files..."
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
          />

          <div className="space-y-3">
            {filteredFiles.map((f, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition p-4 rounded-xl"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {f.originalName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {f.projectTitle} • {f.studentName}
                  </p>
                </div>

                <button
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-200 transition"
                  onClick={() =>
                    handleDownload(f.projectId, f.fileId, f.originalName)
                  }
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {isCreateStudentModalOpen && <AddStudent />}
    {isCreateTeacherModalOpen && <AddTeacher />}
  </div>
</>

 )

};

export default AdminDashboard;
