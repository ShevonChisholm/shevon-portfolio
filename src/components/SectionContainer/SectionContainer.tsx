'use client';

import { Box, Container, Typography, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionContainerProps {
  id: string;
  title: string;
  children: ReactNode;
  subtitle?: string;
}

export default function SectionContainer({ id, title, subtitle, children }: SectionContainerProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 8, md: 12 },
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'clip',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ width: '100%', minWidth: 0 }}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 6,
                color: theme.palette.text.secondary,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              {subtitle}
            </Typography>
          )}

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ width: '100%', minWidth: 0 }}
          >
            {children}
          </m.div>
        </m.div>
      </Container>
    </Box>
  );
} 
