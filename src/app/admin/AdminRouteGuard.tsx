"use client";

import { ReactNode, useEffect } from "react";
import { Box, CircularProgress, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { useMeQuery } from "@/lib/api/auth-api";
import { clearStoredSession } from "@/lib/auth/auth-storage";
import { clearSession, setContext } from "@/lib/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

type AdminRouteGuardProps = {
  children: ReactNode;
};

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { accessToken, context, hydrated } = useAppSelector((state) => state.auth);
  const isLoginRoute = pathname === "/admin/login";
  const shouldVerify = hydrated && Boolean(accessToken) && !isLoginRoute;
  const { data, error, isFetching, isLoading } = useMeQuery(undefined, {
    skip: !shouldVerify,
    refetchOnMountOrArgChange: true,
  });

  const activeContext = data ?? context;
  const checkingSession =
    !isLoginRoute &&
    (!hydrated || (shouldVerify && !activeContext && (isLoading || isFetching)));

  useEffect(() => {
    if (!data) return;
    dispatch(setContext(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (isLoginRoute || !hydrated) return;

    if (!accessToken) {
      router.replace("/admin/login");
      return;
    }

    if (error) {
      dispatch(clearSession());
      clearStoredSession();
      router.replace("/admin/login?error=api_unavailable");
      return;
    }

    if (activeContext && !activeContext.is_admin) {
      router.replace("/");
    }
  }, [
    accessToken,
    activeContext,
    dispatch,
    error,
    hydrated,
    isLoginRoute,
    router,
  ]);

  if (isLoginRoute) {
    return children;
  }

  if (checkingSession || !accessToken || (activeContext && !activeContext.is_admin)) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: `radial-gradient(circle at top, ${alpha(
            theme.palette.primary.main,
            0.14
          )}, transparent 34%), ${theme.palette.background.default}`,
          px: 2,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary" }}>
            Checking admin session...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return children;
}
