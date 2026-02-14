import { AlertCircle, CheckCircle2, FileDown, Folder, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { approveProject, getProject, rejectProject } from "../../store/slices/adminSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const supervisors = useMemo(() => {
    const set = new Set(
      projects?.map((p) => p?.supervisor?.name).filter(Boolean),
    );
    return Array.from(set);
  }, [projects]);

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const matchesSupervisor =
      filterSupervisor === "all" ||
      project.supervisor?.name === filterSupervisor;
    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        originalName: f.originalName,
        uploadedAt: f.createdAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files?.filter(
    (file) =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()),
  );

const handleDownloadFile = async (file) => {
  try {
    const res = await dispatch(
      downloadProjectFile({
        projectId: file.projectId,
        fileId: file.fileId,
      })
    );

    // If using Redux Toolkit thunk
    if (res.meta.requestStatus !== "fulfilled") {
      throw new Error("Download failed");
    }

    const blob = res.payload;

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", file.originalName || "download");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("File download failed:", error);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";

      case "pending":
        return "bg-orange-100 text-orange-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter((p) => p.status === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter((p) => p.status === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];


  return (
  <>
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Management
          </h1>
          <p className="text-sm text-slate-500">
            Monitor, review and manage all student projects.
          </p>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
        >
          <FileDown className="w-5 h-5" />
          Download Files
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>
                <p className="text-xl font-semibold text-slate-800">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Title */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Projects Overview
          </h2>
        </div>

        {/* Search + Filter */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

            {/* Search */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3 text-left">Project</th>
                <th className="px-6 py-3 text-left">Student</th>
                <th className="px-6 py-3 text-left">Supervisor</th>
                <th className="px-6 py-3 text-left">Deadline</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project) => (
                <tr
                  key={project._id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {project.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">
                      {project.description}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {project?.student?.name}
                  </td>

                  <td className="px-6 py-4">
                    {project.supervisor?.name ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        {project.supervisor.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "NA"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={async () => {
                        const res = await dispatch(
                          getProject(project._id)
                        );
                        if (!getProject.fulfilled.match(res)) return;
                        const detail =
                          res.payload?.project || res.payload;
                        setCurrentProject(detail);
                        setShowViewModal(true);
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      View
                    </button>

                    {project.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(project._id, "approved")
                          }
                          className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(project._id, "rejected")
                          }
                          className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              No projects found.
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && currentProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-2xl shadow-xl p-8 relative">

            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Project Details
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-500 mb-1">Title</p>
                <div className="bg-slate-50 rounded-lg px-4 py-2">
                  {currentProject.title}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <div className="bg-slate-50 rounded-lg px-4 py-2">
                  {currentProject.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Student</p>
                  <div className="bg-slate-50 rounded-lg px-4 py-2">
                    {currentProject.student?.name || "-"}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Supervisor</p>
                  <div className="bg-slate-50 rounded-lg px-4 py-2">
                    {currentProject.supervisor?.name || "-"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DOWNLOAD FILES MODAL */}
{isReportOpen && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-2xl shadow-xl p-8 relative">

      <button
        onClick={() => setIsReportOpen(false)}
        className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold text-slate-800 mb-6">
        Download Project Files
      </h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {files.length === 0 && (
          <p className="text-slate-500 text-sm">
            No files available.
          </p>
        )}

        {files.map((file) => (
          <div
            key={file.fileId}
            className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-slate-700">
                {file.originalName}
              </p>
              <p className="text-xs text-slate-500">
                {file.projectTitle} • {file.studentName}
              </p>
            </div>

            <button
              onClick={() => handleDownloadFile(file)}
              className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  </>
);


};

export default ProjectsPage;
