'use client';

import { useEffect, useState } from 'react';
import { Fab, useTheme, Zoom } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { m as motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Zoom in={isVisible}>
            <Fab
              onClick={scrollToTop}
              aria-label="scroll back to top"
              sx={{
                bgcolor: '#FF6600',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#FF6600',
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 20px ${theme.palette.mode === 'dark' 
                    ? 'rgba(255, 102, 0, 0.4)'
                    : 'rgba(255, 102, 0, 0.25)'}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 4px 14px ${theme.palette.mode === 'dark'
                  ? 'rgba(255, 102, 0, 0.3)'
                  : 'rgba(255, 102, 0, 0.2)'}`,
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </Zoom>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 