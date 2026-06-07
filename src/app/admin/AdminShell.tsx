"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const expandedDrawerWidth = 280;
const collapsedDrawerWidth = 84;
const sidebarStorageKey = "admin-sidebar-collapsed";

const navigationIcons = {
  dashboard: DashboardOutlinedIcon,
  projects: FolderOutlinedIcon,
  blogPosts: ArticleOutlinedIcon,
  experience: WorkOutlineOutlinedIcon,
  education: SchoolOutlinedIcon,
  skills: PsychologyOutlinedIcon,
  messages: EmailOutlinedIcon,
  testimonials: RateReviewOutlinedIcon,
  settings: SettingsOutlinedIcon,
};

const navigationItems = [
  { label: "Dashboard", href: "/admin/dashboard", iconKey: "dashboard" },
  { label: "Projects", href: "/admin/projects", iconKey: "projects" },
  { label: "Blog Posts", href: "/admin/blog", iconKey: "blogPosts" },
  { label: "Experience", href: "/admin/experience", iconKey: "experience" },
  { label: "Education", href: "/admin/education", iconKey: "education" },
  { label: "Skills", href: "/admin/skills", iconKey: "skills" },
  { label: "Messages", href: "/admin/messages", iconKey: "messages" },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    iconKey: "testimonials",
  },
  { label: "Settings", href: "/admin/settings", iconKey: "settings" },
] satisfies Array<{
  label: string;
  href: string;
  iconKey: keyof typeof navigationIcons;
}>;

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem(sidebarStorageKey) === "true");
  }, []);

  if (pathname === "/admin/login") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `radial-gradient(circle at top left, ${alpha(
            theme.palette.primary.main,
            0.2
          )}, transparent 34%), ${theme.palette.background.default}`,
        }}
      >
        {children}
      </Box>
    );
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue to the login page even if the remote sign-out request fails.
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed((collapsed) => {
      const nextValue = !collapsed;
      localStorage.setItem(sidebarStorageKey, String(nextValue));
      return nextValue;
    });
  };

  const renderDrawer = (collapsed: boolean) => (
    <Box
      sx={{
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
      }}
    >
      <Toolbar
        sx={{
          minHeight: 76,
          px: collapsed ? 1.5 : 2.5,
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              SC Admin
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap" }}
            >
              Portfolio CMS
            </Typography>
          </Box>
        )}

        {isDesktop && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={handleSidebarToggle}
              sx={{
                color: theme.palette.text.secondary,
                flexShrink: 0,
                "&:hover": {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.14) }} />

      <List
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          px: collapsed ? 1 : 1.5,
          py: 2,
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.5)} transparent`,
          "&::-webkit-scrollbar": {
            width: 5,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.primary.main, 0.42),
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.72),
          },
        }}
      >
        {navigationItems.map((item) => {
          const Icon = navigationIcons[item.iconKey];
          const active =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          const navigationButton = (
            <ListItemButton
              key={item.label}
              component={Link}
              href={item.href}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                minHeight: 46,
                borderRadius: 1,
                mb: 0.75,
                px: collapsed ? 1.25 : 2,
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.75,
                  justifyContent: "center",
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                  }}
                />
              )}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.label} title={item.label} placement="right">
              {navigationButton}
            </Tooltip>
          ) : (
            navigationButton
          );
        })}
      </List>

      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <Tooltip
          title={collapsed ? "Sign Out" : ""}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <ListItemButton
            onClick={handleSignOut}
            sx={{
              minHeight: 46,
              borderRadius: 1,
              px: collapsed ? 1.25 : 2,
              justifyContent: collapsed ? "center" : "flex-start",
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.light,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "inherit",
                minWidth: 0,
                mr: collapsed ? 0 : 1.75,
                justifyContent: "center",
              }}
            >
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Sign Out" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const desktopDrawerWidth = sidebarCollapsed
    ? collapsedDrawerWidth
    : expandedDrawerWidth;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${desktopDrawerWidth}px)` },
          ml: { md: `${desktopDrawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.default, 0.82),
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          backdropFilter: "blur(18px)",
          transition: theme.transitions.create(["width", "margin-left"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 2 }}>
          {!isDesktop && (
            <Tooltip title="Open navigation">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Admin CMS
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Content operations for the portfolio
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: desktopDrawerWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: expandedDrawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            },
          }}
        >
          {renderDrawer(false)}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: desktopDrawerWidth,
              boxSizing: "border-box",
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                duration: theme.transitions.duration.shorter,
              }),
            },
          }}
        >
          {renderDrawer(sidebarCollapsed)}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${desktopDrawerWidth}px)` },
          minWidth: 0,
          pt: { xs: 11, md: 12 },
          px: { xs: 2, sm: 3, lg: 5 },
          pb: 5,
          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
