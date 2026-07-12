"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
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
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { clearStoredSession } from "@/lib/auth/auth-storage";
import { clearSession } from "@/lib/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

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
  leads: PersonSearchOutlinedIcon,
  proposals: RequestQuoteOutlinedIcon,
  clients: GroupsOutlinedIcon,
  clientProjects: BusinessCenterOutlinedIcon,
  packages: Inventory2OutlinedIcon,
  discovery: SearchOutlinedIcon,
  followUps: CalendarMonthOutlinedIcon,
};

type NavigationItem = {
  label: string;
  href: string;
  iconKey: keyof typeof navigationIcons;
};

const navigationGroups: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", iconKey: "dashboard" }],
  },
  {
    label: "Sales Pipeline",
    items: [
      { label: "Leads", href: "/admin/leads", iconKey: "leads" },
      { label: "Discovery", href: "/admin/discovery", iconKey: "discovery" },
      { label: "Follow-ups", href: "/admin/follow-ups", iconKey: "followUps" },
      { label: "Proposals", href: "/admin/proposals", iconKey: "proposals" },
    ],
  },
  {
    label: "Delivery",
    items: [
      { label: "Clients", href: "/admin/clients", iconKey: "clients" },
      { label: "Client Projects", href: "/admin/client-projects", iconKey: "clientProjects" },
    ],
  },
  {
    label: "Operations",
    items: [{ label: "Packages", href: "/admin/packages", iconKey: "packages" }],
  },
  {
    label: "Portfolio CMS",
    items: [
      { label: "Portfolio Projects", href: "/admin/projects", iconKey: "projects" },
      { label: "Blog Posts", href: "/admin/blog", iconKey: "blogPosts" },
      { label: "Experience", href: "/admin/experience", iconKey: "experience" },
      { label: "Education", href: "/admin/education", iconKey: "education" },
      { label: "Skills", href: "/admin/skills", iconKey: "skills" },
      { label: "Messages", href: "/admin/messages", iconKey: "messages" },
      { label: "Testimonials", href: "/admin/testimonials", iconKey: "testimonials" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", iconKey: "settings" }],
  },
];

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken } = useAppSelector((state) => state.auth);
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
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });
    } catch {
      // Continue to the login page even if the remote sign-out request fails.
    } finally {
      dispatch(clearSession());
      clearStoredSession();
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
          minHeight: collapsed ? 88 : 76,
          px: collapsed ? 1 : 2.5,
          py: collapsed ? 0.75 : 0,
          flexDirection: collapsed ? "column" : "row",
          justifyContent: collapsed ? "center" : "space-between",
          gap: collapsed ? 0.25 : 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src="/sc-logo.svg"
            alt="Shevon Chisholm logo"
            sx={{
              width: collapsed ? 32 : 38,
              height: collapsed ? 32 : 38,
              flexShrink: 0,
            }}
          />
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
                Admin CRM
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap" }}
              >
                Shevon Chisholm
              </Typography>
            </Box>
          )}
        </Box>

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
        {navigationGroups.map((group) => (
          <Box key={group.label} sx={{ mb: collapsed ? 0.75 : 1.5 }}>
            {!collapsed && (
              <Typography
                sx={{
                  px: 1.5,
                  pb: 0.65,
                  color: "text.secondary",
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  letterSpacing: "0.11em",
                  textTransform: "uppercase",
                }}
              >
                {group.label}
              </Typography>
            )}
            {group.items.map((item) => {
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
                    minHeight: 42,
                    borderRadius: 1,
                    mb: 0.35,
                    px: collapsed ? 1.25 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                    "&.Mui-selected": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.14),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
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
                      mr: collapsed ? 0 : 1.5,
                      justifyContent: "center",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.82rem",
                        fontWeight: active ? 800 : 600,
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
          </Box>
        ))}
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
  const desktopRailWidth = desktopDrawerWidth + 12;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        position: "relative",
        overflowX: "clip",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 12,
          left: {
            xs: 12,
            md: `${desktopRailWidth}px`,
          },
          width: {
            xs: "calc(100% - 24px)",
            md: `calc(100% - ${desktopRailWidth + 12}px)`,
          },
          boxSizing: "border-box",
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          borderRadius: 1,
          backdropFilter: "blur(18px)",
          transition: theme.transitions.create(["width", "left"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 60, gap: { xs: 1, sm: 1.5 }, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
            {!isDesktop && (
              <Tooltip title="Open navigation">
                <IconButton edge="start" color="inherit" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )}
            <Box component="img" src="/sc-logo.svg" alt="Shevon Chisholm logo" sx={{ width: 34, height: 34, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 900, lineHeight: 1.15 }}>
                Admin CRM
              </Typography>
              <Typography noWrap sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary", fontSize: "0.7rem" }}>
                Business operations and portfolio management
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", flexShrink: 0 }}>
            <ThemeToggle />
            <Button component={Link} href="/" color="inherit" startIcon={<ChevronLeftIcon />} sx={{ display: { xs: "none", sm: "inline-flex" }, color: "text.secondary", whiteSpace: "nowrap" }}>
              Back to site
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          position: { xs: "absolute", md: "relative" },
          width: { xs: 0, md: desktopRailWidth },
          minWidth: { xs: 0, md: desktopRailWidth },
          maxWidth: { xs: 0, md: desktopRailWidth },
          flexBasis: { xs: 0, md: desktopRailWidth },
          flexShrink: 0,
          overflow: { xs: "visible", md: "hidden" },
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
              maxWidth: "calc(100vw - 24px)",
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
              top: 12,
              bottom: 12,
              left: 12,
              height: "calc(100% - 24px)",
              boxSizing: "border-box",
              border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
              borderRadius: 1,
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
          flexBasis: {
            xs: "100%",
            md: `calc(100% - ${desktopRailWidth}px)`,
          },
          width: {
            xs: "100%",
            md: `calc(100% - ${desktopRailWidth}px)`,
          },
          maxWidth: "100%",
          minWidth: 0,
          ml: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
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
