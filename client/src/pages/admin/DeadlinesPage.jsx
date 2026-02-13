import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../store/slices/adminSlice";


import { createDeadline } from "../../store/slices/deadlineSlice";
import { X } from "lucide-react";

const DeadlinesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    projectTitle: "",
    studentName: "",
    supervisor: "",
    deadlineDate: "",
    description: "",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [query, setQuery] = useState("");

 const dispatch = useDispatch();

useEffect(() => {
  console.log("STEP 2 - dispatching getAllProjects");
  dispatch(getAllProjects());
}, [dispatch]);


  const { projects } = useSelector((state) => state.admin);

console.log("STEP A - projects type:", typeof projects, projects);


  const [viewProject, setviewProject] = useState(projects || []);
  useEffect(() => {
    setviewProject(projects || []);
  }, [projects]);

  const projectRows = useMemo(() => {
    return (viewProject || []).map((p) => ({
      _id: p._id,
      title: p.title,
      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",
      studentDept: p.student?.department || "-",
      supervisor: p.supervisor?.name || "-",
      deadline: p.deadline
        ? new Date(p.deadline).toISOString().slice(0, 10)
        : "-",
      updatedAt: p.updatedAt
        ? new Date(p.updatedAt).toLocaleString().slice(0, 10)
        : "-",
      row: p,
    }));
  }, [viewProject]);

  const filteredProject = projectRows.filter((row) => {
    const q = searchTerm.toLowerCase();
    return (
      (row.title || "").toLowerCase().includes(q) ||
      (row.studentName || "").toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    const deadlineData = {
      name: selectedProject?.student?.name || "-",

      dueDate: formData.deadlineDate,
      description: formData.description,
      project: selectedProject?._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({
          id: selectedProject._id,
          data: deadlineData,
        }),
      ).unwrap();

      const updatedProject = updated?.project || updated;

      if (updatedProject?._id) {
        setviewProject((prev) =>
          prev.map((p) =>
            p._id === updatedProject._id ? { ...p, ...updatedProject } : p,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowModal(false);
      setFormData({
        projectTitle: "",
        studentName: "",
        supervisor: "",
        deadlineDate: "",
        description: "",
      });
      setSelectedProject(null);
      setQuery("");
    }
  };

  const searchedProjects = useMemo(() => {
  if (!query) return [];

  return (projects || []).filter((p) =>
    p.title?.toLowerCase().includes(query.toLowerCase())
  );
}, [query, projects]);


  return (
    <>
  <div className="space-y-8">

    {/* Header */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Deadlines
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create and monitor project submission deadlines
        </p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all shadow-sm"
      >
        + Create / Update Deadline
      </button>
    </div>

    {/* Search */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Search Projects
      </label>
      <input
        type="text"
        placeholder="Search by project title or student name..."
        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Table */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Project Deadlines
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Student</th>
              <th className="px-6 py-4 text-left">Project</th>
              <th className="px-6 py-4 text-left">Supervisor</th>
              <th className="px-6 py-4 text-left">Deadline</th>
              <th className="px-6 py-4 text-left">Updated</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredProject.map((row) => (
              <tr
                key={row._id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {row.studentName}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {row.studentEmail}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 font-medium text-slate-800">
                  {row.title}
                </td>

                <td className="px-6 py-4">
                  {row.supervisor !== "-" ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      {row.supervisor}
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                      Not Assigned
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-slate-700">
                  {row.deadline}
                </td>

                <td className="px-6 py-4 text-slate-500">
                  {row.updatedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProject.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No matching projects found.
        </div>
      )}
    </div>

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-8 max-h-screen overflow-y-auto">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              Create / Update Deadline
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="relative">
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Project Title
  </label>

  <input
    type="text"
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      setSelectedProject(null);
    }}
    placeholder="Search and select project..."
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
  />

  {/* Dropdown Results */}
  {query && !selectedProject && searchedProjects.length > 0 && (

    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl mt-2 max-h-48 overflow-y-auto shadow-lg">
      {searchedProjects.map((p) => (
        <div
          key={p._id}
          onClick={() => {
  setSelectedProject(p);
  setQuery(p.title);
}}

          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
        >
          <div className="font-medium text-slate-800">{p.title}</div>
          <div className="text-xs text-slate-500">
            {p.student?.name}
          </div>
        </div>
      ))}
    </div>
  )}

  {query && searchedProjects.length === 0 && (
    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl mt-2 p-3 text-sm text-slate-500 shadow-lg">
      No projects found
    </div>
  )}
</div>


            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Deadline Date
              </label>
              <input
                type="date"
                disabled={!selectedProject}
                value={formData.deadlineDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deadlineDate: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition disabled:bg-slate-100"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition shadow-sm"
              >
                Save Deadline
              </button>
            </div>

          </form>
        </div>
      </div>
    )}
  </div>
</>

  )
};

export default DeadlinesPage;
