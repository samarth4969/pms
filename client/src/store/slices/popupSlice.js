import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isCreateStudentModalOpen: false,
    isCreateTeacherModalOpen: false,
  },
  reducers: {
    toggleStudentModel(state){
      state.isCreateStudentModalOpen=!state.isCreateStudentModalOpen;
    },
    toggleTeacherModel(state){
      state.isCreateTeacherModalOpen=!state.isCreateTeacherModalOpen;
    },
  },
});

export const {toggleStudentModel,toggleTeacherModel}=popupSlice.actions;

export default popupSlice.reducer;
