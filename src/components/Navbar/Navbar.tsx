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
            color:
              activeSection === item.id
                ? theme.palette.text.primary
                : theme.palette.text.secondary,
            position: 'relative',
            px: 1.25,
            py: 1,
            minWidth: 0,
            fontSize: '0.82rem',
            fontWeight: 700,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: activeSection === item.id ? 'translateX(-50%)' : 'translateX(-50%) scaleX(0)',
              width: 'calc(100% - 20px)',
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
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'clip',
          bgcolor: alpha(theme.palette.background.default, trigger ? 0.94 : 0.82),
          transition: 'all 0.3s ease-in-out',
          backdropFilter: {
            xs: 'blur(14px)',
            md: trigger ? 'blur(16px)' : 'blur(12px)',
          },
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, trigger ? 0.16 : 0.08)}`,
        }}
      >
        <Container maxWidth={false} sx={{ width: '100%', maxWidth: 1040 }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 62 },
              justifyContent: 'space-between',
              position: 'relative',
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
                    width: { xs: 34, sm: 34 },
                    height: { xs: 34, sm: 34 },
                    display: "block",
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
                      fontSize: { xs: "0.92rem", sm: "0.9rem" },
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
                      fontSize: "0.58rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Full-Stack Engineer
                  </Box>
                </Box>
              </Box>

            </Box>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <NavLinks />
            </Box>

            <IconButton
              color="inherit"
              aria-label="Open navigation"
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
                    minHeight: 36,
                    px: 2.5,
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
            width: 'min(88vw, 340px)',
            bgcolor: alpha(theme.palette.background.default, 0.98),
            borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            boxShadow: `-24px 0 60px ${alpha(theme.palette.common.black, 0.45)}`,
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.14)}` }}>
          <Box
            component="img"
            src="/sc-logo.svg"
            alt="Shevon Chisholm logo"
            sx={{
              width: 44,
              height: 44,
              display: "block",
              mb: 1.5,
            }}
          />
          <Box sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Shevon Chisholm</Box>
          <Box sx={{ color: 'primary.main', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Full-Stack Engineer
          </Box>
        </Box>
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
