import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRoute: 'Time Tracking',
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setRoute(state, action) {
      state.currentRoute = action.payload;
    }
  },
});

export const { setRoute} = routeSlice.actions;
export const selectCurrentRoute = (state) => state.route.currentRoute;
export default routeSlice.reducer;
