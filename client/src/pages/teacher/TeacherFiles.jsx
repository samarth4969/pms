import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { getFiles, downloadTeacherFile } from "../../store/slices/teacherSlice";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const filesFromStore = useSelector((state) => state.teacher.files) || [];

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  const deriveTypeFormatName = (name) => {
    if (!name) return "unknown";
    return name.split(".").pop().toLowerCase();
  };

  const normalizeFile = (f) => {
    const type = deriveTypeFormatName(f.originalName);

    let category = "other";
    if (["pdf", "doc", "docx"].includes(type)) category = "report";
    else if (["ppt", "pptx"].includes(type)) category = "presentation";
    else if (["zip", "rar"].includes(type)) category = "archive";
    else if (["js", "jsx", "java", "py", "html", "css"].includes(type))
      category = "code";
    else if (["jpg", "jpeg", "png"].includes(type)) category = "image";

    return {
      _id: f._id,
      name: f.originalName,
      type,
      category,
      student: f.studentName || "Unknown",
      uploadedAt: f.uploadedAt
        ? new Date(f.uploadedAt).toLocaleDateString()
        : "N/A",

      projectId: f.projectId,
      fileId: f._id,
    };
  };

  const files = useMemo(
    () => filesFromStore.map(normalizeFile),
    [filesFromStore],
  );

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesType = filterType === "all" ? true : f.category === filterType;
    const matchesSearch = f.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDownloadFile = async (file) => {
    const res = await dispatch(
      downloadTeacherFile({
        projectId: file.projectId,
        fileId: file.fileId,
      }),
    );

    if (res.meta.requestStatus === "fulfilled") {
      const { blob } = res.payload; // ✅ CORRECT
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const fileStats = [
    {
      label: "Total Files",
      value: files.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Reports",
      value: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "Presentations",
      value: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-700",
      sub: "text-orange-600",
    },
    {
      label: "Code Files",
      value: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  return (
  <div className=" space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
    {/* HEADER */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Student Files
          </h1>
          <p className="text-slate-500 text-sm">
            View and download files submitted by your students
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {fileStats.map((item) => (
          <div
            key={item.label}
            className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* SEARCH & FILTER */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Search files..."
        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="report">Reports</option>
        <option value="presentation">Presentations</option>
        <option value="code">Code</option>
        <option value="image">Images</option>
        <option value="archive">Archives</option>
      </select>
    </div>

    {/* FILE GRID */}
    {filteredFiles.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16 text-center text-slate-400">
        <File className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">No files found</p>
        <p className="text-sm">Try adjusting your search or filter</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <div
            key={file._id}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition">
                {getFileIcon(file.type)}
              </div>

              <div>
                <p className="font-semibold text-slate-800 truncate max-w-[160px]">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {file.student} • {file.uploadedAt}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownloadFile(file)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 text-sm font-medium"
              aria-label={`Download file ${file.name}`}
              title="Download file"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

};

export default TeacherFiles;
