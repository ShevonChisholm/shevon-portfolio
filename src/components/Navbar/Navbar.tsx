"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  LockOutlined as LockOutlinedIcon,
  Menu as MenuIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { publicContainerSx } from "@/theme/layout";

const navItems = [
  { label: "Home", href: "/", id: "home", type: "link" },
  { label: "Services", href: "/services", id: "services", type: "link" },
  { label: "Projects", href: "/#projects", id: "projects", type: "anchor" },
  { label: "Experience", href: "/#experience", id: "experience", type: "anchor" },
  { label: "Blog", href: "/#blog", id: "blog", type: "anchor" },
  { label: "Contact", href: "/#contact", id: "contact", type: "anchor" },
];

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Box
      component="img"
      src="/sc-logo.svg"
      alt="Shevon Chisholm logo"
      sx={{ width: size, height: size, display: "block", flexShrink: 0 }}
    />
  );
}

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToAnchor = (href: string) => {
    setMobileOpen(false);

    if (!href.includes("#")) {
      router.push(href);
      return;
    }

    const [, id] = href.split("#");
    if (pathname !== "/") {
      router.push(href);
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", href);
  };

  const navButtonSx = (active: boolean) => ({
    minWidth: 0,
    px: 0.5,
    py: 0.5,
    color: active ? "primary.main" : "text.secondary",
    fontSize: "0.76rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
    "&:hover": { color: "primary.main", bgcolor: "transparent" },
  });

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "clip",
        bgcolor: alpha(theme.palette.background.default, isScrolled ? 0.9 : 1),
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${
          isScrolled
            ? alpha(theme.palette.common.white, 0.1)
            : alpha(theme.palette.common.white, 0.04)
        }`,
        transition: "background-color 180ms ease, border-color 180ms ease",
      }}
    >
      <Container maxWidth="xl" sx={publicContainerSx}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 68, md: isScrolled ? 64 : 72 },
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            transition: "min-height 180ms ease",
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              minWidth: 0,
              flexShrink: 0,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <LogoMark />
            <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: "0.82rem",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                }}
              >
                Shevon Chisholm
              </Typography>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.56rem",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Full-Stack Engineer
              </Typography>
            </Box>
          </Box>

          <Stack
            component="nav"
            direction="row"
            spacing={1.8}
            sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", width: "auto" }}
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.type === "link"
                    ? pathname === item.href
                    : false;

              if (item.type === "link") {
                return (
                  <Button key={item.label} component={Link} href={item.href} sx={navButtonSx(active)}>
                    {item.label}
                  </Button>
                );
              }

              return (
                <Button key={item.label} onClick={() => navigateToAnchor(item.href)} sx={navButtonSx(active)}>
                  {item.label}
                </Button>
              );
            })}
            <Button
              component={Link}
              href="/client"
              startIcon={<LockOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={navButtonSx(pathname.startsWith("/client"))}
            >
              Client Portal
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.1} sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", width: "max-content" }}>
            <ThemeToggle />
            <Button
              component={Link}
              href="/resume"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: 999,
                whiteSpace: "nowrap",
                color: "text.primary",
                borderColor: alpha(theme.palette.common.white, 0.16),
                "&:hover": { borderColor: "primary.main", color: "primary.main" },
              }}
            >
              View Resume
            </Button>
            <Button
              component={Link}
              href="/start-project"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
              sx={{ minHeight: 36, px: 2, borderRadius: 999, whiteSpace: "nowrap" }}
            >
              Start a Project
            </Button>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center" }}>
            <ThemeToggle />
            <IconButton
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              sx={{ color: "text.primary" }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      {mobileOpen && (
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            bgcolor: alpha(theme.palette.background.default, 0.98),
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.38)}`,
          }}
        >
          <Container maxWidth="xl" sx={{ ...publicContainerSx, py: 1.2 }}>
            <Stack component="nav" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={item.type === "link" ? Link : "button"}
                  href={item.type === "link" ? item.href : undefined}
                  onClick={() => item.type === "anchor" && navigateToAnchor(item.href)}
                  sx={{
                    justifyContent: "flex-start",
                    minHeight: 46,
                    color: "text.primary",
                    borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
                    borderRadius: 1,
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                component={Link}
                href="/client"
                startIcon={<LockOutlinedIcon />}
                onClick={() => setMobileOpen(false)}
                sx={{ justifyContent: "flex-start", minHeight: 46, color: "text.primary" }}
              >
                Client Portal
              </Button>
              <Stack spacing={1.1} sx={{ pt: 1.5, pb: 1 }}>
                <Button
                  component={Link}
                  href="/resume"
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                >
                  View Resume
                </Button>
                <Button
                  component={Link}
                  href="/start-project"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                >
                  Start a Project
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}
    </AppBar>
  );
}
