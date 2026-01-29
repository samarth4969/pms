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
      <div className="space-y-6">
        {/* Header   */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">All Project</h1>
              <p className="card-subtitle">
                View and manage all student projects here.
              </p>
            </div>
            <button
              onClick={() => setIsReportOpen(true)}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <FileDown className="w-5 h-5" />
              <span>Download project</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4">
          {projectStats.map((item, index) => {
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${item.bg}`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {item.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search projects
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Search by project title or student name ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                className="input w-full"
                placeholder="Search by project title or student name ..."
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Supervisor
              </label>
              <select
                className="input w-full"
                placeholder="Search by project title or student name ..."
                value={filterSupervisor}
                onChange={(e) => setFilterSupervisor(e.target.value)}
              >
                <option value="all">All Supervisor</option>
                {supervisors.map((supervisor) => {
                  return (
                    <option key={supervisor} value={supervisor}>
                      {supervisor}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Projects table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Projects overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Project details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="bg-slate-50">
                    <td className="px-6 py-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {project.title}
                        </div>
                        <div className="text-sm text-slate-500 max-w-xs truncate">
                          {project.description}
                        </div>
                        <div className="text-xs text-slate -400">
                          Due :{" "}
                          {project.deadline && project.deadline.split("T")[0]}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {project?.student?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Last update:{" "}
                        {project?.updatedAt
                          ? new Date(project.updatedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "NA"}
                      </div>

                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-900 inline-flex items-center px-2.5 py-0.5 rounded-full font-medium">{project.supervisor?.name?(
                        <span className="bg-green-100 text-green-800">{project.supervisor?.name}</span>
                      ):("Unassigned")}</div>
                    </td>
                    <td className="px=6 py=3 whitespace-nowrap">
{project.deadline ? new Date(project.deadline).toLocaleDateString(): "NA"}
                    </td>
                    <td className="px=6 py=3 whitespace-nowrap">
{<span className={`inline-flex capitalized item-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>{project.status}</span>}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={async()=>{
                          const res=await dispatch(getProject(project._id));
                          if(!getProject.fulfilled.match(res)) return ;
                          const detail=res.payload?.project||res.payload;
                          setCurrentProject(detail);
                          setShowViewModal(true);
                        }}
                        className="btn-primary">View</button>
                        {
                          project.status==="pending"&&(
                            <>
                            <button className="btn-secondary" onClick={()=>handleStatusChange(project._id,"approved")}>Approve</button>
                            <button className="btn-danger" onClick={()=>handleStatusChange(project._id,"rejected")}>Reject</button>
                            </>
                          )
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {
            filteredProjects.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                No projects found matching the criteria.
              </div>
            )
          }
        </div>

         {/* View Project Modal */}
{showViewModal && currentProject && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
      {/* Close */}
      <button
        onClick={() => setShowViewModal(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold mb-6">Project Details</h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Title
          </label>
          <input
            disabled
            value={currentProject.title}
            className="input w-full bg-slate-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Description
          </label>
          <input
            disabled
            value={currentProject.description}
            className="input w-full bg-slate-50"
          />
        </div>

        {/* Student & Supervisor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">
              Student
            </label>
            <input
              disabled
              value={currentProject.student?.name || "-"}
              className="input w-full bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-1">
              Supervisor
            </label>
            <input
              disabled
              value={currentProject.supervisor?.name || "-"}
              className="input w-full bg-slate-50"
            />
          </div>
        </div>

        {/* Status & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">
              Status
            </label>
            <input
              disabled
              value={currentProject.status}
              className="input w-full bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-1">
              Deadline
            </label>
            <input
              disabled
              value={
                currentProject.deadline
                  ? new Date(
                      currentProject.deadline
                    ).toLocaleDateString()
                  : "N/A"
              }
              className="input w-full bg-slate-50"
            />
          </div>
        </div>

        {/* Files */}
        <div>
          <label className="block text-sm text-slate-500 mb-1">
            Files
          </label>
          <p className="text-sm text-slate-400">
            {currentProject.files?.length
              ? `${currentProject.files.length} file(s) uploaded`
              : "No files uploaded"}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{/* Download Files Modal */}
{isReportOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative max-h-[80vh] overflow-y-auto">
      <button
        onClick={() => setIsReportOpen(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold mb-4">
        Download Project Files
      </h2>

      <input
        type="text"
        className="input w-full mb-4"
        placeholder="Search files..."
        value={reportSearch}
        onChange={(e) => setReportSearch(e.target.value)}
      />

      {filteredFiles.length === 0 ? (
        <p className="text-slate-500">No files found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredFiles.map((file) => (
            <li
              key={file.fileId}
              className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {file.originalName}
                </p>
                <p className="text-sm text-slate-500">
                  Project: {file.projectTitle} | Student:{" "}
                  {file.studentName}
                </p>
              </div>
              <button
                onClick={() => handleDownloadFile(file)}
                className="btn-primary"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}




      </div>
    </>
  );
};

export default ProjectsPage;
