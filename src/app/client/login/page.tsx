"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useLoginMutation } from "@/lib/api/auth-api";
import { saveStoredSession } from "@/lib/auth/auth-storage";
import { setSession } from "@/lib/auth/auth-slice";
import { useAppDispatch } from "@/lib/store/hooks";

function ClientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [login, loginState] = useLoginMutation();
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/client/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("error") ? "Please sign in again to continue." : null
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      const session = await login({
        email: email.trim(),
        password,
        audience: "Client",
      }).unwrap();
      dispatch(setSession(session));
      saveStoredSession(session);
      router.replace(returnTo);
      router.refresh();
    } catch {
      setMessage("Could not sign in. Check your email and password.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background: `radial-gradient(circle at top left, ${alpha(
          theme.palette.primary.main,
          0.18
        )}, transparent 34%), ${theme.palette.background.default}`,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 430,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.82),
        }}
      >
        <Stack spacing={2.25}>
          <Box component="img" src="/sc-logo.svg" alt="Shevon Chisholm logo" sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              Client Portal
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Sign in to review your project, tasks, approvals, and payments.
            </Typography>
          </Box>
          {message && <Alert severity="warning">{message}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<LockOutlinedIcon />}
            disabled={loginState.isLoading || !email.trim() || !password}
          >
            {loginState.isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <Button component={Link} href="/" color="inherit">
            Back to site
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={null}>
      <ClientLoginContent />
    </Suspense>
  );
}
