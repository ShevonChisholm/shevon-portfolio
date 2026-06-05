"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("chisholmshevon@gmail.com");
  const [password, setPassword] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setPasswordLoading(false);
      setMessage({
        type: "error",
        text: error.message || "Unable to sign in. Please check your details.",
      });
      return;
    }

    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    setPasswordLoading(false);

    if (adminProfileError || !adminProfile) {
      await supabase.auth.signOut();
      setMessage({
        type: "error",
        text: "This account does not have admin access.",
      });
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  const handleMagicLink = async () => {
    setMessage(null);
    setMagicLinkLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
      },
    });

    setMagicLinkLoading(false);

    if (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to send magic link.",
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Magic link sent. Check your email to continue.",
    });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: 8,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: { xs: 3, sm: 4 },
          borderRadius: "24px",
          backgroundColor: alpha(theme.palette.background.paper, 0.86),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.28)}`,
        }}
      >
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <LockOutlinedIcon />
        </Box>

        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Admin Login
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.7 }}
        >
          Manage your portfolio content, projects, blog posts, skills,
          experience, education, and contact messages.
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={passwordLoading || magicLinkLoading}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={passwordLoading || magicLinkLoading}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={passwordLoading || magicLinkLoading}
            sx={{
              py: 1.35,
              borderRadius: "999px",
              fontWeight: 700,
              mb: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 12px 24px ${alpha(
                  theme.palette.primary.main,
                  0.28
                )}`,
              },
            }}
          >
            {passwordLoading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Button
          variant="outlined"
          fullWidth
          disabled={passwordLoading || magicLinkLoading}
          onClick={handleMagicLink}
          sx={{
            py: 1.25,
            borderRadius: "999px",
            fontWeight: 700,
            borderColor: alpha(theme.palette.primary.main, 0.4),
            color: theme.palette.primary.main,
          }}
        >
          {magicLinkLoading ? "Sending link..." : "Send Magic Link"}
        </Button>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: theme.palette.text.secondary,
            mt: 3,
            textAlign: "center",
          }}
        >
          Return to{" "}
          <Link href="/" underline="hover" color="primary">
            public portfolio
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
