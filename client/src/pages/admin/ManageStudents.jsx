import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import { createStudent, deleteStudent, getAllUsers, updateStudent } from "../../store/slices/adminSlice";
import { CheckCircle, Plus, TriangleAlert, Users, X } from "lucide-react";
import { toggleStudentModel } from "../../store/slices/popupSlice";
const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector(state => state.popup);
  const [showModel, setShowModel] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
  dispatch(getAllUsers());
}, [dispatch]);







  const students = useMemo(() => {
  const studentUsers = (users || []).filter(
    u => u.role?.toLowerCase() === "student"
  );

  return studentUsers.map(student => {
    const studentProject = (projects || []).find(
      p =>
        String(p.student?._id || p.student) === String(student._id)
    );

    return {
      ...student,
      projectTitle: studentProject?.title ?? "-",
      projectStatus: studentProject?.status ?? null,
    };
  });
}, [users, projects]);



  const departments = useMemo(() => {
    return Array.from(
      new Set((students || []).map(s => s.department).filter(Boolean))
    );
  }, [students]);


  const filteredStudents = students.filter((student) => {
    const matchesSearch = (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterDepartment === "all" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModel(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    }
    else {
      dispatch(createStudent(formData));
    }

    handleCloseModal();
  }

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      department: student.department || "",
    });
    setShowModel(true);
  }

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }

  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  }


  return (
    <>
  <div className="space-y-8">

    {/* HEADER */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Students
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add, edit and manage student accounts
        </p>
      </div>

      <button
        onClick={() => dispatch(toggleStudentModel())}
        className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
      >
        <Plus className="w-5 h-5" />
        Add Student
      </button>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {students.length}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Completed Projects</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {students.filter(s => s.projectStatus === "completed").length}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Unassigned Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {students.filter(s => !s.supervisor).length}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-xl">
            <TriangleAlert className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
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
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Department
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          Students List
        </h2>
      </div>

      <div className="overflow-x-auto">
        {filteredStudents.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Student</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Supervisor</th>
                <th className="px-6 py-4 text-left">Project</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {student.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {student.department || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {student.supervisor ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {users?.find(u => u._id === student.supervisor)?.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                        {student.projectStatus === "rejected"
                          ? "Rejected"
                          : "Not Assigned"}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {student.projectTitle || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No students found.
          </div>
        )}
      </div>
    </div>

    {/* EDIT MODAL */}
{showModel && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Edit Student
        </h3>
        <button
          onClick={handleCloseModal}
          className="text-slate-400 hover:text-slate-700"
        >
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Department
  </label>

  <select
    required
    value={formData.department}
    onChange={(e) =>
      setFormData({ ...formData, department: e.target.value })
    }
    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
  >
    <option value="">Select Department</option>
    <option value="CS">CS</option>
    <option value="IT">IT</option>
    <option value="ENTC">ENTC</option>
    <option value="AIDS">AIDS</option>
    <option value="Electrical">Electrical</option>
    <option value="Mech">Mechanical</option>
    <option value="Civil">Civil</option>
  </select>
</div>


        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    {/* DELETE MODAL */}
    {showDeleteModal && studentToDelete && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <TriangleAlert className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Student
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {studentToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {isCreateStudentModalOpen && <AddStudent />}
  </div>
</>

  )
};

export default ManageStudents;
