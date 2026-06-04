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
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { m as motion, AnimatePresence } from 'framer-motion';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
          bgcolor: trigger ? theme.palette.background.default : 'transparent',
          transition: 'all 0.3s ease-in-out',
          backdropFilter: trigger ? 'blur(10px)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    onClick={() => handleNavClick("home")}
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: 1.1,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 800,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Shevon Chisholm
                    </Box>

                    <Box
                      component="span"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Full-Stack Engineer
                    </Box>
                  </Box>
                </motion.div>

              </motion.div>

              {!isMobile && (
                <Box sx={{ ml: 4 }}>
                  <NavLinks />
                </Box>
              )}
            </Box>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <AnimatePresence>
        {isMobile && (
          <Drawer
            anchor="right"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{
              sx: {
                width: '70%',
                maxWidth: 300,
                bgcolor: theme.palette.background.default,
              },
            }}
          >
            <List sx={{ mt: 2 }}>
              {navItems.map((item) => (
                <ListItem
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  sx={{
                    bgcolor: activeSection === item.id ? theme.palette.action.selected : 'transparent',
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
              {shouldShowResume && (
              <ListItem>
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
        )}
      </AnimatePresence>
    </>
  );
} 