"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { useLogoutMutation } from "@/lib/api/auth-api";
import { clearStoredSession } from "@/lib/auth/auth-storage";
import { clearSession } from "@/lib/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import ClientRouteGuard from "./ClientRouteGuard";

const expandedDrawerWidth = 256;
const collapsedDrawerWidth = 76;
const sidebarInset = 18;
const sidebarStorageKey = "client-sidebar-collapsed";

const navigationIcons = {
  dashboard: DashboardOutlinedIcon,
  project: TimelineOutlinedIcon,
  tasks: TaskAltOutlinedIcon,
  assets: ImageOutlinedIcon,
  approvals: AssignmentTurnedInOutlinedIcon,
  payments: CreditCardOutlinedIcon,
  support: SupportAgentOutlinedIcon,
  carePlan: HandshakeOutlinedIcon,
  launch: RocketLaunchOutlinedIcon,
  changeRequests: AltRouteOutlinedIcon,
  testimonial: RateReviewOutlinedIcon,
  caseStudies: ArticleOutlinedIcon,
  documents: FolderOutlinedIcon,
};

type NavigationItem = {
  label: string;
  href: string;
  iconKey: keyof typeof navigationIcons;
  disabled?: boolean;
};

const navigationGroups: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/client/dashboard", iconKey: "dashboard" },
      { label: "Project Timeline", href: "/client/project", iconKey: "project" },
      { label: "My Tasks", href: "/client/tasks", iconKey: "tasks" },
      { label: "Assets", href: "/client/assets", iconKey: "assets" },
      { label: "Approvals", href: "/client/approvals", iconKey: "approvals" },
      { label: "Payments", href: "/client/payments", iconKey: "payments" },
      { label: "Documents", href: "/client/documents", iconKey: "documents" },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Support", href: "/client/support", iconKey: "support" },
      { label: "Care Plan", href: "/client/care-plan", iconKey: "carePlan" },
      {
        label: "Launch Checklist",
        href: "/client/launch-checklist",
        iconKey: "launch",
      },
      {
        label: "Change Requests",
        href: "/client/change-requests",
        iconKey: "changeRequests",
      },
      {
        label: "Testimonial",
        href: "/client/testimonial",
        iconKey: "testimonial",
      },
      {
        label: "Case Studies",
        href: "/client/case-studies",
        iconKey: "caseStudies",
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  const match = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => isActive(pathname, item.href));

  return match?.label ?? "Client Portal";
}

export default function ClientPortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken, context } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isLoginRoute = pathname === "/client/login";
  const isPublicInvitationRoute = pathname.startsWith("/client/invitations/");

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem(sidebarStorageKey) === "true");
  }, []);

  if (isLoginRoute || isPublicInvitationRoute) {
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

  const handleSidebarToggle = () => {
    setSidebarCollapsed((collapsed) => {
      const nextValue = !collapsed;
      localStorage.setItem(sidebarStorageKey, String(nextValue));
      return nextValue;
    });
  };

  const handleSignOut = async () => {
    try {
      await logout({
        access_token: accessToken ?? undefined,
        refresh_token: refreshToken ?? undefined,
      });
    } catch {
      // Local session cleanup should still happen if the remote logout fails.
    } finally {
      dispatch(clearSession());
      clearStoredSession();
      router.replace("/client/login");
      router.refresh();
    }
  };

  const renderSidebar = (collapsed: boolean) => (
    <Box
      sx={{
        height: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: alpha(theme.palette.background.paper, 0.74),
      }}
    >
      <Box sx={{ p: collapsed ? 1.25 : 2.5, pb: collapsed ? 1 : 1.5 }}>
        <Box
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 1.4,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="/sc-logo.svg"
            alt="Shevon Chisholm logo"
            sx={{ width: 42, height: 42, flexShrink: 0 }}
          />
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                Client Portal
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Shevon Chisholm
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        component="nav"
        aria-label="Client portal navigation"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          px: collapsed ? 1 : 1.5,
          py: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(theme.palette.text.secondary, 0.42)} transparent`,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.secondary, 0.3),
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.62),
          },
        }}
      >
        <Stack spacing={collapsed ? 1 : 1.5}>
          {navigationGroups.map((group) => (
            <Box key={group.label}>
              {!collapsed && (
                <Typography
                  sx={{
                    px: 1.5,
                    py: 0.8,
                    color: "text.secondary",
                    fontSize: "0.66rem",
                    fontWeight: 950,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {group.label}
                </Typography>
              )}
              <Stack spacing={0.55}>
                {group.items.map((item) => {
                  const Icon = navigationIcons[item.iconKey];
                  const active = isActive(pathname, item.href);
                  const button = (
                    <ListItemButton
                      component={item.disabled ? "button" : Link}
                      href={item.disabled ? undefined : item.href}
                      selected={active}
                      disabled={item.disabled}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        minHeight: collapsed ? 42 : 43,
                        borderRadius: 1.2,
                        px: collapsed ? 0 : 1.5,
                        justifyContent: collapsed ? "center" : "flex-start",
                        border: `1px solid ${
                          active
                            ? alpha(theme.palette.primary.main, 0.28)
                            : "transparent"
                        }`,
                        color: active
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        backgroundColor: active
                          ? alpha(theme.palette.primary.main, 0.12)
                          : "transparent",
                        opacity: item.disabled ? 0.55 : 1,
                        "&.Mui-selected": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        },
                        "&.Mui-selected:hover, &:hover": {
                          backgroundColor: active
                            ? alpha(theme.palette.primary.main, 0.16)
                            : alpha(theme.palette.text.primary, 0.055),
                          color: active
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "inherit",
                          minWidth: 0,
                          mr: collapsed ? 0 : 1.35,
                          justifyContent: "center",
                          "& svg": { fontSize: 19 },
                        }}
                      >
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.86rem",
                            fontWeight: active ? 900 : 760,
                            whiteSpace: "nowrap",
                          }}
                        />
                      )}
                    </ListItemButton>
                  );

                  return collapsed ? (
                    <Tooltip key={item.href} title={item.label} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    <Box key={item.href}>{button}</Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ p: collapsed ? 1 : 1.5, pt: 1 }}>
        <Stack spacing={0.75}>
          <Tooltip
            title={collapsed ? "Back to site" : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              component={Link}
              href="/"
              sx={{
                minHeight: 42,
                borderRadius: 1.2,
                px: collapsed ? 0 : 1.5,
                justifyContent: collapsed ? "center" : "flex-start",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.35,
                  justifyContent: "center",
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Back to site" />}
            </ListItemButton>
          </Tooltip>
          <Tooltip
            title={collapsed ? "Sign out" : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              onClick={handleSignOut}
              sx={{
                minHeight: 42,
                borderRadius: 1.2,
                px: collapsed ? 0 : 1.5,
                justifyContent: collapsed ? "center" : "flex-start",
                color: "text.secondary",
                "&:hover": {
                  color: theme.palette.error.light,
                  backgroundColor: alpha(theme.palette.error.main, 0.12),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.35,
                  justifyContent: "center",
                }}
              >
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Sign Out" />}
            </ListItemButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  const desktopDrawerWidth = sidebarCollapsed
    ? collapsedDrawerWidth
    : expandedDrawerWidth;
  const desktopOffset = desktopDrawerWidth + sidebarInset * 2;

  return (
    <ClientRouteGuard>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          overflowX: "clip",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          component="nav"
          sx={{
            display: { xs: "none", lg: "block" },
            position: "fixed",
            zIndex: theme.zIndex.drawer,
            top: sidebarInset,
            bottom: sidebarInset,
            left: sidebarInset,
            width: desktopDrawerWidth,
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              overflow: "hidden",
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.82),
              boxShadow: `0 20px 80px ${alpha(theme.palette.common.black, 0.24)}`,
            }}
          >
            {renderSidebar(sidebarCollapsed)}
          </Paper>
          <Tooltip title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={handleSidebarToggle}
              sx={{
                position: "absolute",
                top: 82,
                right: -13,
                width: 26,
                height: 26,
                color: "text.secondary",
                backgroundColor: alpha(theme.palette.background.paper, 0.96),
                border: `1px solid ${alpha(theme.palette.text.secondary, 0.25)}`,
                boxShadow: 5,
                "&:hover": {
                  color: "primary.main",
                  borderColor: alpha(theme.palette.primary.main, 0.42),
                },
              }}
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon sx={{ fontSize: 17 }} />
              ) : (
                <ChevronLeftIcon sx={{ fontSize: 17 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              width: 282,
              maxWidth: "calc(100vw - 24px)",
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {renderSidebar(false)}
        </Drawer>

        <Box
          sx={{
            ml: { xs: 0, lg: `${desktopOffset}px` },
            minWidth: 0,
            transition: theme.transitions.create("margin-left", {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5, lg: 0 },
              pr: { lg: `${sidebarInset}px` },
              pt: { xs: 1.5, lg: `${sidebarInset}px` },
              pb: 4,
            }}
          >
            <Paper
              component="header"
              elevation={0}
              sx={{
                position: "sticky",
                top: { xs: 8, lg: sidebarInset },
                zIndex: theme.zIndex.appBar,
                mb: 2.25,
                minHeight: 56,
                px: { xs: 1.25, sm: 1.5, lg: 2 },
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.86),
                backdropFilter: "blur(18px)",
              }}
            >
              {!isDesktop && (
                <Tooltip title="Open navigation">
                  <IconButton
                    color="inherit"
                    aria-label="Open navigation"
                    onClick={() => setMobileOpen(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
              )}
              {!isDesktop && (
                <Box
                  component="img"
                  src="/sc-logo.svg"
                  alt="Shevon Chisholm logo"
                  sx={{ width: 34, height: 34, flexShrink: 0 }}
                />
              )}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 950 }} noWrap>
                  {pageTitle(pathname)}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                  {context?.client_contact?.full_name ||
                    context?.client_contact?.email ||
                    "Client workspace"}
                </Typography>
              </Box>
              <IconButton color="inherit">
                <Badge color="primary" badgeContent={0} variant="dot">
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Button
                component={Link}
                href="/"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: "text.secondary",
                  textTransform: "none",
                  fontWeight: 750,
                  "&:hover": { color: "primary.main" },
                }}
              >
                Back to site
              </Button>
            </Paper>

            <Box component="main" id="main-content" sx={{ maxWidth: "100%" }}>
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </ClientRouteGuard>
  );
}
