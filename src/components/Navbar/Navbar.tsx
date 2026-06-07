'use client';

import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useScrollTrigger,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Blog', id: 'blog' },
  { label: 'Contact', id: 'contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const shouldShowResume = pathname !== '/resume';

  const [isScrolling, setIsScrolling] = useState(false);


  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    if (pathname === '/') {
      const hash = window.location.hash.replace('#', '');

      if (hash && navItems.some(item => item.id === hash)) {
        const element = document.getElementById(hash);
        if (element) {
          requestAnimationFrame(() => {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(hash);
          });
        }
      }

      const handleScroll = () => {
        if (isScrolling) return;

        const sections = navItems.map(item => ({
          id: item.id,
          offset: document.getElementById(item.id)?.offsetTop || 0,
        }));

        const scrollPosition = window.scrollY + 100;

        const currentSection = sections.reduce((acc, section) => {
          return scrollPosition >= section.offset ? section.id : acc;
        }, 'home');

        setActiveSection(currentSection);

        const newHash = `#${currentSection}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isScrolling, pathname]);


  const handleNavClick = (id: string) => {
    setIsScrolling(true);

    if (pathname !== '/') {
      router.push(`/#${id}`);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
        }
        setTimeout(() => setIsScrolling(false), 1000);
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
        window.history.pushState(null, '', `#${id}`);
        setTimeout(() => setIsScrolling(false), 1000);
      }
    }

    if (mobileOpen) setMobileOpen(false);
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          sx={{
            color: theme.palette.text.primary,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: activeSection === item.id ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
              width: '100%',
              height: '2px',
              bgcolor: theme.palette.primary.main,
              transition: 'transform 0.3s ease-in-out',
            },
            '&:hover::after': {
              transform: 'translateX(-50%) scaleX(1)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'clip',
          bgcolor: {
            xs: alpha(theme.palette.background.default, 0.94),
            md: trigger
              ? alpha(theme.palette.background.default, 0.96)
              : alpha(theme.palette.background.default, 0.74),
          },
          transition: 'all 0.3s ease-in-out',
          backdropFilter: {
            xs: 'blur(14px)',
            md: trigger ? 'blur(16px)' : 'blur(12px)',
          },
          borderBottom: {
            xs: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            md: trigger
              ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
              : `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 72 },
              justifyContent: 'space-between',
              minWidth: 0,
              gap: { xs: 1, md: 2 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                flex: { xs: '1 1 auto', md: '0 1 auto' },
              }}
            >
              <Box
                onClick={() => handleNavClick("home")}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                <Box
                  component="img"
                  src="/sc-logo.svg"
                  alt="Shevon Chisholm logo"
                  sx={{
                    width: { xs: 34, sm: 40 },
                    height: { xs: 34, sm: 40 },
                    flexShrink: 0,
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1.1,
                    minWidth: 0,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 800,
                      fontSize: { xs: "1rem", sm: "1.05rem" },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Shevon Chisholm
                  </Box>

                  <Box
                    component="span"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      letterSpacing: 0,
                      textTransform: "uppercase",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Full-Stack Engineer
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 4 }}>
                <NavLinks />
              </Box>
            </Box>

            <IconButton
              color="inherit"
              aria-label="Open navigation"
              edge="end"
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                flexShrink: 0,
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {shouldShowResume && (
                <Button
                  variant="contained"
                  color="primary"
                  href="/resume"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                  }}
                >
                  View Resume
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(82vw, 320px)',
            bgcolor: alpha(theme.palette.background.default, 0.98),
            borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            boxShadow: `-24px 0 60px ${alpha(theme.palette.common.black, 0.45)}`,
          },
        }}
      >
        <List sx={{ mt: 2, px: 1.5 }}>
          {navItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              sx={{
                mb: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                bgcolor:
                  activeSection === item.id
                    ? alpha(theme.palette.primary.main, 0.14)
                    : 'transparent',
                color:
                  activeSection === item.id
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 700 }}
              />
            </ListItem>
          ))}
          {shouldShowResume && (
            <ListItem sx={{ px: 0.5 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                href="/resume"
                sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
              >
                View Resume
              </Button>
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
} 
