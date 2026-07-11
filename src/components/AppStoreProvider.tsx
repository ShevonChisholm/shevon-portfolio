"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { clearStoredSession, loadStoredSession } from "@/lib/auth/auth-storage";
import { clearSession, markHydrated, setSession } from "@/lib/auth/auth-slice";
import { store } from "@/lib/store/store";

type AppStoreProviderProps = {
  children: ReactNode;
};

export default function AppStoreProvider({ children }: AppStoreProviderProps) {
  useEffect(() => {
    const storedSession = loadStoredSession();

    if (storedSession?.access_token && storedSession.refresh_token) {
      store.dispatch(
        setSession({
          access_token: storedSession.access_token,
          refresh_token: storedSession.refresh_token,
          expires_at: storedSession.expires_at,
          token_type: storedSession.token_type,
          user: storedSession.user,
          context: storedSession.context,
        })
      );
      return;
    }

    clearStoredSession();
    store.dispatch(clearSession());
    store.dispatch(markHydrated());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
