import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* ================= SAFE LOCAL STORAGE PARSE ================= */

let savedUser = null;

try {
  const rawUser = localStorage.getItem("authUser");
  savedUser =
    rawUser && rawUser !== "undefined"
      ? JSON.parse(rawUser)
      : null;
} catch (error) {
  savedUser = null;
  localStorage.removeItem("authUser");
}

/* ================= LOGIN ================= */

export const login = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);

      toast.success(res.data.message);

      // 🔥 Backend sends: { success, message, data: { user } }
      return res.data.data.user;

    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* ================= GET USER ================= */

export const getUser = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

/* ================= LOGOUT ================= */

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.post("/auth/logout");
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

/* ================= FORGOT PASSWORD ================= */

export const forgotPassword = createAsyncThunk(
  "auth/password/forgot",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        "/auth/password/forgot",
        { email }
      );
      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message =
        error.response?.data?.message || "Request failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* ================= RESET PASSWORD ================= */

export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        "/auth/password/reset",
        { token, password, confirmPassword }
      );

      toast.success(res.data.message);
      return null;
    } catch (error) {
      const message =
        error.response?.data?.message || "Reset failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: savedUser,
    isLoggingIn: false,
    isCheckingAuth: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ===== LOGIN ===== */

      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;

        // Save safely
        localStorage.setItem(
          "authUser",
          JSON.stringify(action.payload)
        );
      })

      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      /* ===== GET USER ===== */

      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })

      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;

        localStorage.setItem(
          "authUser",
          JSON.stringify(action.payload)
        );
      })

      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
        localStorage.removeItem("authUser");
      })

      /* ===== LOGOUT ===== */

      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
        localStorage.removeItem("authUser");
      })

      /* ===== PASSWORD ===== */

      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })

      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })

      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })

      .addCase(resetPassword.fulfilled, (state) => {
        state.isUpdatingPassword = false;
      })

      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
