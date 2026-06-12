'use client';

import { Box, Container, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
        py: { xs: 9, md: 15 },
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'clip',
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        backgroundColor:
          Number(id.length) % 2 === 0
            ? alpha(theme.palette.background.paper, 0.22)
            : 'transparent',
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%', minWidth: 0, px: { xs: 2.5, sm: 4, lg: 6 } }}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, .8fr) minmax(320px, .45fr)' }, gap: 3, alignItems: 'end', mb: { xs: 5, md: 8 } }}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.12em', display: 'block', mb: 1 }}
              >
                {id.replace(/-/g, ' ')}
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2.3rem', sm: '3.2rem', md: '4.4rem' },
                  lineHeight: 1.02,
                  fontWeight: 700,
                  maxWidth: 820,
                }}
              >
                {title}
              </Typography>
            </Box>

            {subtitle && (
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, maxWidth: 520, lineHeight: 1.8, fontSize: { md: '1.05rem' } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

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
