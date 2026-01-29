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
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Student Files</h1>
            <p className="card-subtitle">
              View and download files submitted by your students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {fileStats.map((item) => (
              <div key={item.label} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.sub}`}>{item.label}</p>
                <p className={`text-2xl font-bold ${item.text}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search files..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="report">Reports</option>
            <option value="presentation">Presentations</option>
            <option value="code">Code</option>
            <option value="image">Images</option>
            <option value="archive">Archives</option>
          </select>
        </div>

        {/* FILE GRID */}
        {filteredFiles.length === 0 ? (
          <div className="card text-center py-10 text-slate-500">
            No files found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file._id}
                className="card flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {file.student} • {file.uploadedAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadFile(file)}
                  className="btn-outline"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherFiles;
