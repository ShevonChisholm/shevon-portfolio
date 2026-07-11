import { configureStore } from "@reduxjs/toolkit";
import { platformApi } from "@/lib/api/base-api";
import { authReducer } from "@/lib/auth/auth-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [platformApi.reducerPath]: platformApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(platformApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
