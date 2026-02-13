import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  rejectRequest,
  acceptRequest,
  getTeacherRequests,
} from "../../store/slices/teacherSlice";
import { FileText } from "lucide-react";

const PendingRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});

  const dispatch = useDispatch();
  const { list = [] } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getTeacherRequests());
    }
  }, [dispatch, authUser?._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);
    try {
      await dispatch(acceptRequest({ requestId: id })).unwrap();
    } catch (error) {
      alert(error?.message || "Accept failed");
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);
    try {
      await dispatch(rejectRequest({ requestId: id })).unwrap();
    } catch (error) {
      alert(error?.message || "Reject failed");
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const filteredRequests = list.filter((request) => {
    const matchesSearch =
      (request?.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request?.latestProject?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-slate-800">
          Supervision Requests
        </h1>
         <p className="text-slate-500 text-sm mt-2">
          Review and manage student supervision requests efficiently.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests */}
      <div className="space-y-5">
        {filteredRequests.map((req) => {
          const id = req._id;
          const project = req.latestProject || {};
          const projectStatus = project?.status?.toLowerCase() || "pending";
          const supervisorAssigned = !!project?.supervisor;
          const canAccept =
            projectStatus === "approved" && !supervisorAssigned;

          const lm = loadingMap[id] || {};

          let badgeColor = "bg-yellow-100 text-yellow-700";
          if (req.status === "accepted")
            badgeColor = "bg-green-100 text-green-700";
          if (req.status === "rejected")
            badgeColor = "bg-red-100 text-red-700";

          return (
            <div
              key={id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {req?.student?.name || "Unknown Student"}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${badgeColor}`}
                    >
                      {req.status?.charAt(0).toUpperCase() +
                        req.status?.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-2">
                    {req?.student?.email || "No email provided"}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 mt-3">
                    <h4 className="font-medium text-slate-700 mb-1">
                      {project?.title || "No Project Title"}
                    </h4>

                    <p className="text-xs text-slate-500">
                      Submitted on{" "}
                      {req?.createdAt
                        ? new Date(req.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex items-center gap-3">
                    <button
                      disabled={lm.accepting || !canAccept}
                      onClick={() => handleAccept(req)}
                      className={`px-4 py-2 text-sm rounded-xl font-medium transition ${
                        canAccept
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {lm.accepting ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      disabled={lm.rejecting}
                      onClick={() => handleReject(req)}
                      className="px-4 py-2 text-sm rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
                    >
                      {lm.rejecting ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
          <FileText className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No Requests Found
          </h3>
          <p className="text-slate-500 text-sm">
            There are no supervision requests matching your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
