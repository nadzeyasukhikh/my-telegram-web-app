import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: '',
    dateOfBirth: '',
    photo: null,
  },
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setDateOfBirth: (state, action) => {
      state.dateOfBirth = action.payload;
    },
    setPhoto: (state, action) => {
      state.photo = action.payload;
    },
  },
});

export const { setName, setDateOfBirth, setPhoto } = userSlice.actions;

export default userSlice.reducer;