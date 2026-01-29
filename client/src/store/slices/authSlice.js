import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
const savedUser = localStorage.getItem("authUser");


export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("STEP 2 → LOGIN API FULL RESPONSE:", res.data);

    toast.success(res.data.message);

    return res.data.user; // DO NOT change this yet
  } catch (error) {
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const forgotPassword =createAsyncThunk("auth/password/forgot",async(email,thunkAPI)=>{
  try {
    const res=await axiosInstance.post("/auth/password/forgot",email);
    toast.success(res.data.message);
    return null;
  } catch (error) {
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.message);

  }
})
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
      toast.error(error.response?.data?.message || "Reset failed");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Reset failed"
      );
    }
  }
);



export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user; // ✅ FIXED
  } catch (error) {
    return thunkAPI.rejectWithValue(null);
  }
});


export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.post("/auth/logout"); // ✅ clears cookie
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);




const authSlice = createSlice({
  name: "auth",
  initialState: {
  authUser: savedUser ? JSON.parse(savedUser) : null, // ✅ IMPORTANT
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isUpdatingPassword: false,
  isRequestingForToken: false,
  isCheckingAuth: false,
},


  extraReducers: (builder) => {
    builder.addCase(login.pending,(state)=>{
      state.isLoggingIn=true;
    }).addCase(login.fulfilled, (state, action) => {
  state.isLoggingIn = false;
  state.authUser = action.payload;

  // ✅ ADD THIS
  localStorage.setItem("authUser", JSON.stringify(action.payload));
}).addCase(login.rejected,(state)=>{
      state.isLoggingIn=false;
    }).addCase(getUser.pending,(state)=>{
      state.isCheckingAuth=true;
      // state.authUser=null;
    }).addCase(getUser.fulfilled,(state,action)=>{
      state.isCheckingAuth=false;
      state.authUser=action.payload;
    }).addCase(getUser.rejected, (state) => {
  state.isCheckingAuth = false;
  state.authUser = null; // ✅ MUST
  localStorage.removeItem("authUser");
}).addCase(logout.fulfilled, (state) => {
  state.authUser = null;
  state.isCheckingAuth = false;

  // ✅ STEP 3: Clear saved user
  localStorage.removeItem("authUser");
})
.addCase(logout.rejected,(state)=>{
      state.authUser=state.authUser;
    }).addCase(forgotPassword.pending,(state)=>{
      state.isRequestingForToken=true;
      
    }).addCase(forgotPassword.fulfilled,(state,action)=>{
      state.isRequestingForToken=false;
    }).addCase(forgotPassword.rejected,(state)=>{
      state.isRequestingForToken=false;
    }).addCase(resetPassword.pending,(state)=>{
      state.isUpdatingPassword=true;
      
    }).addCase(resetPassword.fulfilled,(state,action)=>{
      state.isUpdatingPassword=false;
      // state.authUser=action.payload;
    }).addCase(resetPassword.rejected,(state)=>{
      state.isUpdatingPassword=false;
    })
  },
});

export default authSlice.reducer;
