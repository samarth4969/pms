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
      assignSupervisorThunk({  supervisorId, projectId }),
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
    {/* PAGE HEADER */}
    <div className="mb-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-800">
          Assign Supervisors
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage supervisor assignment for student projects
        </p>
      </div>
    </div>

     {/* SUMMARY CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {dashboardCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 ${card.bg} rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">{card.title}</p>
                <p className="text-xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* FILTERS */}
    <div className="card mb-6 bg-slate-50 border mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search students
          </label>
          <input
            type="text"
            placeholder="Search by student name or project title..."
            className="input-field w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Filter status
          </label>
          <select
            className="input-field w-full"
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
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Student Assignments</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {filtered.map((row) => (
              <tr
                key={row.projectId}
                className="hover:bg-slate-50 transition"
              >
                {/* STUDENT */}
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {row.studentName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {row.studentEmail}
                    </div>
                  </div>
                </td>

                {/* PROJECT */}
                <td className="px-6 py-4">{row.title}</td>

                {/* SUPERVISOR STATUS */}
                <td className="px-6 py-4">
                  {row.supervisor ? (
                    <Badge color="bg-green-100 text-green-800">
                      {row.supervisor}
                    </Badge>
                  ) : (
                    <Badge
                      color={
                        row.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {row.status === "rejected"
                        ? "Rejected"
                        : "Not Assigned"}
                    </Badge>
                  )}
                </td>

                {/* DEADLINE */}
                <td className="px-6 py-4">{row.deadline}</td>

                {/* UPDATED */}
                <td className="px-6 py-4">{row.updatedAt}</td>

                {/* SELECT SUPERVISOR */}
                <td className="px-6 py-4">
                  <select
                    className={`input-field w-full ${
                      row.supervisor ||
                      row.status === "rejected" ||
                      !row.isApproved
                        ? "bg-slate-100 cursor-not-allowed"
                        : ""
                    }`}
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
                    <option value="" disabled>
                      Select supervisor
                    </option>
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
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      row.supervisor
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : row.status === "rejected"
                        ? "bg-red-100 text-red-700 cursor-not-allowed"
                        : !row.isApproved
                        ? "bg-yellow-100 text-yellow-700 cursor-not-allowed"
                        : "btn-primary"
                    }`}
                    onClick={() =>
                      handleAssign(row.studentId, row.status, row.projectId)
                    }
                    disabled={
                      pendingFor === row.projectId ||
                      row.status === "rejected" ||
                      !row.isApproved ||
                      !selectedSupervisor[row.projectId]
                    }
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
          <div className="text-center py-8 text-slate-500">
            No students found matching your criteria
          </div>
        )}
      </div>
    </div>

   
  </>
);

};

export default AssignSupervisor;
