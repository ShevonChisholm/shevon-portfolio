"use client";

import { ReactNode, useState } from "react";
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
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { supabase } from "@/lib/supabase/client";

const drawerWidth = 280;

const navigationIcons = {
  dashboard: DashboardOutlinedIcon,
  projects: FolderOutlinedIcon,
  blogPosts: ArticleOutlinedIcon,
  experience: WorkOutlineOutlinedIcon,
  education: SchoolOutlinedIcon,
  skills: PsychologyOutlinedIcon,
  messages: EmailOutlinedIcon,
  settings: SettingsOutlinedIcon,
};

const navigationItems = [
  { label: "Dashboard", href: "/admin/dashboard", iconKey: "dashboard" },
  { label: "Projects", href: "/admin/projects", iconKey: "projects" },
  { label: "Blog Posts", href: "/admin/dashboard#blog-posts", iconKey: "blogPosts" },
  { label: "Experience", href: "/admin/experience", iconKey: "experience" },
  { label: "Education", href: "/admin/education", iconKey: "education" },
  { label: "Skills", href: "/admin/skills", iconKey: "skills" },
  { label: "Messages", href: "/admin/dashboard#messages", iconKey: "messages" },
  { label: "Settings", href: "/admin/dashboard#settings", iconKey: "settings" },
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
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
      }}
    >
      <Toolbar sx={{ minHeight: 76, px: 3 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            SC Admin
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Portfolio CMS
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.14) }} />

      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navigationItems.map((item) => {
          const Icon = navigationIcons[item.iconKey];
          const active =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
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
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleSignOut}
          sx={{
            minHeight: 46,
            borderRadius: 1,
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.light,
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItemButton>
      </Box>
    </Box>
  );

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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.default, 0.82),
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          backdropFilter: "blur(18px)",
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

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          pt: { xs: 11, md: 12 },
          px: { xs: 2, sm: 3, lg: 5 },
          pb: 5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
