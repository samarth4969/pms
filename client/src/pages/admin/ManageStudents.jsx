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


  return <>

    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="card-title">Manage Students</h1>
            <p className="card-subtitle">
              Add, edit, and manage student accounts
            </p>
          </div>
          <button
            onClick={() => dispatch(toggleStudentModel())}
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Student</span>
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
              <p className="text-sm font-medium text-slate-600">Total Students</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">
                Completed Projects
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter(s => s.projectStatus === "completed").length}
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
              <p className="text-sm font-medium text-slate-600">Unassigned Students</p>
              <p className="text-lg font-semibold text-slate-800">
                {students.filter(s => !s.supervisor).length}
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
              Search Students
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

      {/* Students table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student List</h2>
        </div>
        <div className="overflow-x-auto">


          {
            filteredStudents && filteredStudents.length > 0 && (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Department & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50">
                        {/* Student Info */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {student.email}
                            </div>
                            {student.studentId && (
                              <div className="text-xs text-slate-400">
                                ID: {student.studentId}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Department & Year */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {student.department || "-"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {student.createdAt
                              ? new Date(student.createdAt).getFullYear()
                              : "-"}
                          </div>
                        </td>

                        {/* Supervisor */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.supervisor ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                              {users?.find(u=>u._id===student?.supervisor)?.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                              {student.projectStatus === "rejected"
                                ? "Rejected"
                                : "Not Assigned"}
                            </span>
                          )}
                        </td>

                        {/* Project Title */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">
                            {student.projectTitle || "-"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
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
                        No students found
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
                  Edit student
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

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="btn-danger">Cancel</button>
                  <button type="submit" className="btn-primary">Update Student</button>
                </div>

              </form>
            </div>
          </div>
        )}


        {/* Show delete model */}
        {
          showDeleteModal && studentToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center bg-red-100 rounded-full">
                    <TriangleAlert className="w-6 h-6 text-red-600" />
                  </div>
                </div>


                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Delete student</h3>
                  <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete<span> {studentToDelete.name}? This action cannot be undone</span></p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">Cancel</button>
                    <button onClick={confirmDelete} className="btn-danger">Delete</button>
                  </div>

                </div>


              </div></div>
          )
        }

        {isCreateStudentModalOpen && <AddStudent />}

      </div>
    </div >
  </>;
};

export default ManageStudents;
