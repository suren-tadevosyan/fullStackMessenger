import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    username: "",
    isLoggedIn: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.id = action.payload.userId;
    },
    logoutUser: (state) => {
      state.username = "";
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export const selectUser = (state) => state.user;

export default userSlice.reducer;
