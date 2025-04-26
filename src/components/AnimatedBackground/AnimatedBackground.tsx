'use client';

import { m } from 'framer-motion';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Predefined shapes to ensure consistent rendering between server and client
const SHAPES = [
  { id: 0, size: 120, x: 15, y: 25, duration: 25, delay: 0 },
  { id: 1, size: 85, x: 80, y: 10, duration: 20, delay: 1 },
  { id: 2, size: 150, x: 45, y: 70, duration: 22, delay: 2 },
  { id: 3, size: 95, x: 5, y: 45, duration: 28, delay: 3 },
  { id: 4, size: 140, x: 75, y: 55, duration: 24, delay: 1.5 },
  { id: 5, size: 110, x: 30, y: 85, duration: 26, delay: 2.5 },
  { id: 6, size: 75, x: 65, y: 35, duration: 23, delay: 0.5 },
  { id: 7, size: 130, x: 90, y: 65, duration: 21, delay: 1.8 }
];

export default function AnimatedBackground() {
  const theme = useTheme();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none', // Ensure the background doesn't interfere with interactions
      }}
    >
      {SHAPES.map((shape) => (
        <m.div
          key={shape.id}
          style={{
            position: 'absolute',
            width: shape.size,
            height: shape.size,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: alpha(theme.palette.primary.main, 0.1),
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
} 