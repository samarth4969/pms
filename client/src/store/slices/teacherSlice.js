import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* =========================
   ASYNC THUNKS
========================= */

export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch dashboard stats");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const getTeacherRequests = createAsyncThunk(
  "teacher/getRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/requests");
      return res.data.data.requests;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const acceptRequest = createAsyncThunk(
  "teacher/acceptRequest",
  async ({ requestId }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/accept`);
      toast.success("Request accepted successfully");
      return res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "teacher/rejectRequest",
  async ({ requestId }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/reject`);
      toast.success("Request rejected successfully");
      return res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-students");
      return res.data.data; // ✅ ARRAY
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch assigned students");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const markComplete = createAsyncThunk(
  "teacher/markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/mark-complete/${projectId}`);
      toast.success("Project marked as complete");
      return res.data.data.project;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to mark project as complete");
      return thunkAPI.rejectWithValue(error?.response?.data?.message || "Error");
    }
  }
);

export const addFeedback = createAsyncThunk(
  "teacher/addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload
      );

      toast.success("Feedback added successfully");
      return { projectId, feedback: res.data.data.feedback };
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to add feedback"
      );
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Error"
      );
    }
  }
);



export const downloadTeacherFile = createAsyncThunk(
  "downloadTeacherFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        }
      );

      return { blob: res.data, projectId, fileId };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to download file";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getFiles = createAsyncThunk(
  "teacher/getFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/files");
      return res.data.data.files; // ✅ ALWAYS ARRAY
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch files";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);




/* =========================
   SLICE
========================= */

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    dashboardStats: null,
    list: [],
    pendingRequests: [],
    files: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* Assigned students */
      .addCase(getAssignedStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload;
      })
      .addCase(getAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* Mark complete */
      .addCase(markComplete.fulfilled, (state, action) => {
        const updatedProject = action.payload;
        state.assignedStudents = state.assignedStudents.map((s) =>
          s.project._id === updatedProject._id
            ? { ...s, project: updatedProject }
            : s
        );
      })

      /* Feedback */
      .addCase(addFeedback.fulfilled, (state, action) => {
        const { projectId, feedback } = action.payload;
        state.assignedStudents = state.assignedStudents.map((s) =>
          s.project._id === projectId
            ? { ...s, project: { ...s.project, feedback } }
            : s
        );
      })

      /* Dashboard */
      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
  state.dashboardStats = action.payload.data;
})

      .addCase(getFiles.fulfilled, (state, action) => {
        state.files = action.payload?.files||action.payload||[] ;
      })

      /* Requests */
      .addCase(getTeacherRequests.fulfilled, (state, action) => {
        state.list = action.payload;
        state.pendingRequests = action.payload;
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.list = state.list.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload._id);
      });
  },
});

export default teacherSlice.reducer;
