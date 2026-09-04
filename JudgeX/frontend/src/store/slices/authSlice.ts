import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

const savedToken = localStorage.getItem('token');
let initialUser: any = null;

if (savedToken) {
  try {
    const decoded: any = jwtDecode(savedToken);
    if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
      initialUser = { id: decoded.id, email: decoded.email, username: decoded.username || decoded.email };
    } else {
      localStorage.removeItem('token');
    }
  } catch {
    localStorage.removeItem('token');
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: initialUser ? savedToken : null,
  isAuthenticated: !!initialUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
