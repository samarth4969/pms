import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* ===================== THUNKS ===================== */

// Get all notifications
export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/notification");

      console.log("✅ FULL API RESPONSE:", res.data);

      // ✅ FIX: return correct nested data
      return res.data.data.notifications;

    } catch (error) {
      console.error("❌ NOTIFICATION ERROR:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);






// Mark single notification as read
export const markAsRead = createAsyncThunk(
  "markAsRead",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/notification/${id}/read`);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to mark notification as read";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  "markAllAsRead",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.put("/notification/read-all");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to mark all as read";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "deleteNotification",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/notification/${id}/delete`);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete notification";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* ===================== SLICE ===================== */

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔔 FETCH
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;

        console.log("🔥 NOTIFICATIONS LOADED:", action.payload);

        state.list = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ MARK READ
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.list = state.list.map((n) =>
          n._id === action.payload ? { ...n, isRead: true } : n
        );
      })

      // ✅ MARK ALL READ
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, isRead: true }));
      })

      // ❌ DELETE
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n._id !== action.payload);
      });
  },
});

export default notificationSlice.reducer;
