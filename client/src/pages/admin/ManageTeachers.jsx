import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import { getAllUsers } from "../../store/slices/adminSlice";
import { createTeacher, updateTeacher, deleteTeacher } from "../../store/slices/adminSlice"
import { toggleTeacherModel } from "../../store/slices/popupSlice";

import {
  Plus,
  Users,
  BadgeCheck,
  TriangleAlert,
  X,
} from "lucide-react";




const ManageTeachers = () => {

  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector(state => state.popup);
  const [showModel, setShowModel] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    experties: "",
    password: "",
    maxStudents: 10,

  });

  const dispatch = useDispatch();



  const teachers = useMemo(() => {
    return (users || []).filter(
      (u) => u.role?.toLowerCase() === "teacher"
    );
  }, [users]);


  const departments = useMemo(() => {
    return Array.from(
      new Set((teachers || []).map(t => t.department).filter(Boolean))
    );
  }, [teachers]);


  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterDepartment === "all" || teacher.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModel(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      experties: "",
      maxStudents: 10,
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
    }
    else {
      dispatch(createTeacher(formData));
    }

    handleCloseModal();
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      department: teacher.department || "",
      experties: Array.isArray(teacher.experties) ? teacher.experties[0] : teacher.experties || "",
      maxStudents: typeof teacher.maxStudents === "number" ? teacher.maxStudents : 10,
    });
    setShowModel(true);
  }

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  }

  const confirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }

  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  }







  return (
    <>
  <div className="space-y-8">

    {/* HEADER */}
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Teachers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add, edit and manage teacher accounts
        </p>
      </div>

      <button
        onClick={() => dispatch(toggleTeacherModel())}
        className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
      >
        <Plus className="w-5 h-5" />
        Add Teacher
      </button>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Total Teachers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {teachers.length}
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
            <p className="text-sm text-slate-500">Assigned Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {teachers.reduce(
                (sum, t) => sum + (t.assignedStudents?.length || 0),
                0
              )}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-xl">
            <BadgeCheck className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Departments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {departments.length}
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
            Search Teachers
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
          Teachers List
        </h2>
      </div>

      <div className="overflow-x-auto">
        {filteredTeachers.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Teacher</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Expertise</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher._id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">
                        {teacher.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {teacher.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {teacher.department || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {Array.isArray(teacher.experties)
                      ? teacher.experties.join(", ")
                      : teacher.experties || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {teacher.createdAt
                      ? new Date(teacher.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
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
            No teachers found.
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
          Edit Teacher
        </h3>
        <button
          onClick={handleCloseModal}
          className="text-slate-400 hover:text-slate-700"
        >
          <X />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

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
    value={formData.department}
    onChange={(e) =>
      setFormData({ ...formData, department: e.target.value })
    }
    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    required
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


        <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Expertise
  </label>
  <select
    value={formData.experties}
    onChange={(e) =>
      setFormData({ ...formData, experties: e.target.value })
    }
    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    required
  >
    <option value="">Select Expertise</option>
    <option value="Artificial Intelligence">Artificial Intelligence</option>
    <option value="Machine Learning">Machine Learning</option>
    <option value="Data Science">Data Science</option>
    <option value="Deep Learning">Deep Learning</option>
    <option value="Web Development">Web Development</option>
    <option value="Full Stack Development">Full Stack Development</option>
    <option value="Cloud Computing">Cloud Computing</option>
    <option value="Cyber Security">Cyber Security</option>
    <option value="IoT">IoT</option>
    <option value="Embedded Systems">Embedded Systems</option>
  </select>
</div>


        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max Students
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxStudents}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxStudents: Number(e.target.value),
              })
            }
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
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
    {showDeleteModal && teacherToDelete && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <TriangleAlert className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Teacher
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {teacherToDelete.name}
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

    {isCreateTeacherModalOpen && <AddTeacher />}
  </div>
</>

  )
};

export default ManageTeachers;
