import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleStudentModel } from "../../store/slices/popupSlice"
import { X } from "lucide-react";
import { createStudent } from "../../store/slices/adminSlice";

const AddStudent = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "CS",
    password: ""
  });

  const handleCreateStudent = (e) => {
    e.preventDefault();

    dispatch(createStudent(formData));

    setFormData({
      name: "",
      email: "",
      department: "CS",
      password: ""
    });

    dispatch(toggleStudentModel());
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Student
            </h3>
            <button
              onClick={() => dispatch(toggleStudentModel())}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateStudent} className="space-y-4">
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
                className="w-full py-1 border-b border-slate-600 focus:outline-none"
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
                className="w-full py-1 border-b border-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full py-1 border-b border-slate-600 focus:outline-none"
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
                className="w-full py-1 border-b border-slate-600 focus:outline-none"
              >
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

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(toggleStudentModel())}
                className="btn-danger"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
