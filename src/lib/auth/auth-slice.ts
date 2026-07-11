import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthContext, AuthSession, AuthUser } from "@/lib/api/auth-types";

export type AuthStatus = "idle" | "authenticated" | "unauthenticated";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  tokenType: string;
  user: AuthUser | null;
  context: AuthContext | null;
  status: AuthStatus;
  hydrated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  tokenType: "bearer",
  user: null,
  context: null,
  status: "idle",
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.expiresAt = action.payload.expires_at ?? null;
      state.tokenType = action.payload.token_type ?? "bearer";
      state.user = action.payload.user;
      state.context = action.payload.context;
      state.status = "authenticated";
      state.hydrated = true;
    },
    setContext(state, action: PayloadAction<AuthContext>) {
      state.context = action.payload;
      state.user = {
        id: action.payload.auth_user_id,
        email: action.payload.email,
      };
      state.status = "authenticated";
      state.hydrated = true;
    },
    clearSession(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.tokenType = "bearer";
      state.user = null;
      state.context = null;
      state.status = "unauthenticated";
      state.hydrated = true;
    },
    markHydrated(state) {
      state.hydrated = true;
      if (state.status === "idle") {
        state.status = "unauthenticated";
      }
    },
  },
});

export const { clearSession, markHydrated, setContext, setSession } =
  authSlice.actions;

export const authReducer = authSlice.reducer;
