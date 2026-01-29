import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const downloadProjectFile = createAsyncThunk(
  "project/downloadProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/admin/download/${projectId}/${fileId}`,
        { responseType: "blob" }
      );

      return { blob: res.data, projectId, fileId };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to download file";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default projectSlice.reducer;
