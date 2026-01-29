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







  return <>

    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title">Manage Teachers</h1>
            <p className="card-subtitle">
              Add, edit, and manage teachers accounts
            </p>
          </div>
          <button
            onClick={() => dispatch(toggleTeacherModel())}
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Teachers</p>
              <p className="text-lg font-semibold text-slate-800">
                {teachers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">
                Assigned Students
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {teachers.reduce(
                  (sum, t) => sum + (t.assignedStudents?.length || 0),
                  0
                )}

              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TriangleAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Departments</p>
              <p className="text-lg font-semibold text-slate-800">
                {departments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Teachers
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Department
            </label>
            <select
              className="input-field w-full"
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

      {/* Teachers table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Teachers List</h2>
        </div>
        <div className="overflow-x-auto">


          {
            filteredTeachers && filteredTeachers.length > 0 && (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Teacher Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Experties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Join dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-slate-50">
                        {/* Teacher Info */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {teacher.email}
                            </div>

                          </div>
                        </td>

                        {/* Department & Year */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {teacher.department || "-"}
                          </div>

                        </td>

                        {/* Supervisor */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {Array.isArray(teacher.experties) && teacher.experties.length > 0
                            ? teacher.experties.join(", ")
                            : teacher.experties || "-"}
                        </td>



                        {/* Project Title */}
                        < td className="px-6 py-4" >


                          <div className="text-sm text-slate-900">
                            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "-"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(teacher)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500">
                        No teachers found
                      </td>
                    </tr>
                  )}
                </tbody>


              </table>
            )
          }


        </div>

        {/* Edit student modal */}
        {showModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit teacher
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:to-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full name
                  </label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    <option value="CS">CS</option>
                    <option value="IT">IT</option>
                    <option value="ENTC">ENTC</option>
                    <option value="AIDS">AIDS</option>
                    <option value="ANR">ANR</option>
                    <option value="Instru">Instru</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mech">Mech</option>
                    <option value="Civil">Civil</option>

                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Experties
                  </label>
                  <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" required value={formData.experties} onChange={(e) => setFormData({ ...formData, experties: e.target.value })}>

                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Deep Learning">Deep Learning</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Natural Language Processing">Natural Language Processing</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="VLSI Design">VLSI Design</option>

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max students
                  </label>
                  <input type="number" required value={formData.maxStudents} max={10} min={1} onChange={(e) =>
                    setFormData({ ...formData, maxStudents: Number(e.target.value) })
                  }
                    className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-danger">Cancel</button>
                  <button type="submit" className="btn-primary">Update Teacher</button>
                </div>

              </form>
            </div>
          </div>
        )}


        {/* Show delete model */}
        {
          showDeleteModal && teacherToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center bg-red-100 rounded-full">
                    <TriangleAlert className="w-6 h-6 text-red-600" />
                  </div>
                </div>


                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Delete teacher</h3>
                  <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete<span> {teacherToDelete.name}? This action cannot be undone</span></p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">Cancel</button>
                    <button onClick={confirmDelete} className="btn-danger">Delete</button>
                  </div>

                </div>


              </div></div>
          )
        }

        {isCreateTeacherModalOpen && <AddTeacher />}

      </div >
    </div >

  </>;
};

export default ManageTeachers;
