import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModel } from "../../store/slices/popupSlice";

const AddTeacher = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "CS",
    password: "",
    experties: "",
    maxStudents: 1,
  });

  const handleCreateTeacher = (e) => {
    e.preventDefault();

    dispatch(createTeacher(formData));

    setFormData({
      name: "",
      email: "",
      department: "CS",
      password: "",
      experties: "",
      maxStudents: 1,
    });

    dispatch(toggleTeacherModel());
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Teacher
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModel())}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateTeacher} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Experties
              </label>
              <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" required value={formData.experties} onChange={(e) => setFormData({ ...formData, experties: e.target.value })}>
                <option value="">Select area of Experties</option>

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

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(toggleTeacherModel())}
                className="btn-danger"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
