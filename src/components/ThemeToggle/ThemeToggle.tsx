'use client';

import { IconButton } from '@mui/material';
import { m as motion } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useContext } from 'react';
import { ThemeContext } from '../ThemeRegistry/ThemeRegistry';

export default function ThemeToggle() {
  const { mode, toggleColorMode } = useContext(ThemeContext);

  return (
    <IconButton
      onClick={toggleColorMode}
      color="inherit"
      aria-label="toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: mode === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </motion.div>
    </IconButton>
  );
} 