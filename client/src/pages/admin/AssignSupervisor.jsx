import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";
import { getAllProjects } from "../../store/slices/adminSlice";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});

  const { users, projects } = useSelector((state) => state.admin);
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => u.role.toLowerCase() === "teacher",
    );
    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents)
        ? t.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
  return (projects || []).map((p) => ({
    projectId: p._id,
    title: p.title,
    status: p.status,
    supervisor: p.supervisor?.name || null,
    supervisorId: p.supervisor?._id || null,
    studentId: p.student?._id || null,
    studentName: p.student?.name || "Unassigned",
    studentEmail: p.student?.email || "-",
    deadline: p.deadline
      ? new Date(p.deadline).toISOString().slice(0, 10)
      : "-",
    updatedAt: p.updatedAt
      ? new Date(p.updatedAt).toLocaleString()
      : "-",
    isApproved: p.status === "approved",
  }));
}, [projects]);


  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        row.studentName?.toLowerCase().includes(search) ||
        row.studentEmail?.toLowerCase().includes(search) ||
        row.title?.toLowerCase().includes(search);

      const status = row.supervisor ? "assigned" : "unassigned";
      const matchesFilter = filterStatus === "all" || filterStatus === status;

      return matchesSearch && matchesFilter;
    });
  }, [studentProjects, searchTerm, filterStatus]);

  const [pendingFor, setPendingFor] = useState(null);
  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };
  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    console.log("ASSIGN DEBUG:", {
      studentId,
      supervisorId,
    });

    if (!supervisorId) {
  toast.error("Please select a supervisor first");
  return;
}

    if (projectStatus === "rejected") {
      toast.error("Cannot assign supervisor to rejected supervisor");
      return;
    }
    setPendingFor(projectId);
    const res = await dispatch(
      assignSupervisorThunk({  supervisorId, projectId,studentId }),
    );
    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    } else {
      toast.error("Failed to asssign supervisor");
    }
  };

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // TABLE HEADER
  const headers = [
    "Student",
    "Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  const Badge = ({ color, children }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {children}
      </span>
    );
  };

 return (
  <>
  <div className="space-y-8">

    {/* HEADER */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Assign Supervisors
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage supervisor assignments for approved student projects
        </p>
      </div>
    </div>

    {/* DASHBOARD CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {dashboardCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* FILTERS */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search Students
          </label>
          <input
            type="text"
            placeholder="Search by student name, email, or project..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter Status
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Student Assignments
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-6 py-4 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filtered.map((row) => (
              <tr
                key={row.projectId}
                className="hover:bg-slate-50 transition-colors"
              >
                {/* STUDENT */}
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {row.studentName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.studentEmail}
                    </div>
                  </div>
                </td>

                {/* PROJECT */}
                <td className="px-6 py-4 font-medium text-slate-800">
                  {row.title}
                </td>

                {/* SUPERVISOR STATUS */}
                <td className="px-6 py-4">
                  {row.supervisor ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      {row.supervisor}
                    </span>
                  ) : row.status === "rejected" ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Not Assigned
                    </span>
                  )}
                </td>

                {/* DEADLINE */}
                <td className="px-6 py-4 text-slate-700">
                  {row.deadline}
                </td>

                {/* UPDATED */}
                <td className="px-6 py-4 text-slate-500">
                  {row.updatedAt}
                </td>

                {/* SELECT SUPERVISOR */}
                <td className="px-6 py-4">
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:bg-slate-100"
                    value={selectedSupervisor[row.projectId] || ""}
                    disabled={
                      !!row.supervisor ||
                      row.status === "rejected" ||
                      !row.isApproved
                    }
                    onChange={(e) =>
                      handleSupervisorSelect(row.projectId, e.target.value)
                    }
                  >
                    <option value="">Select supervisor</option>
                    {teachers
                      .filter((t) => t.capacityLeft > 0)
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.capacityLeft} slots left)
                        </option>
                      ))}
                  </select>
                </td>

                {/* ACTION */}
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleAssign(row.studentId, row.status, row.projectId)
                    }
                    disabled={
                      pendingFor === row.projectId ||
                      row.status === "rejected" ||
                      !row.isApproved ||
                      !selectedSupervisor[row.projectId]
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      row.supervisor
                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                        : row.status === "rejected"
                        ? "bg-red-100 text-red-700 cursor-not-allowed"
                        : !row.isApproved
                        ? "bg-yellow-100 text-yellow-700 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    }`}
                  >
                    {pendingFor === row.projectId
                      ? "Assigning..."
                      : row.supervisor
                      ? "Assigned"
                      : "Assign"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No students match your filters.
          </div>
        )}
      </div>
    </div>
  </div>
</>

 )

};

export default AssignSupervisor;
