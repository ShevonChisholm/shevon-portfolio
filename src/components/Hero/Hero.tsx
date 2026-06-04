'use client';

import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { m as motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Link from 'next/link';

const buttonTransition =
  'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)';

const primaryButtonSx = (theme: Theme) => ({
  borderRadius: '50px',
  minHeight: { xs: 52, sm: 56 },
  px: { xs: 3.5, sm: 4.5 },
  py: 1.75,
  fontSize: { xs: '1.05rem', sm: '1.125rem' },
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: theme.palette.primary.main,
  boxShadow: `0 2px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
  transition: buttonTransition,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}, 0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
});

const secondaryButtonSx = (theme: Theme) => ({
  borderRadius: '50px',
  minHeight: { xs: 52, sm: 56 },
  px: { xs: 3.5, sm: 4 },
  py: 1.75,
  fontSize: { xs: '1rem', sm: '1.05rem' },
  fontWeight: 500,
  textTransform: 'none',
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  transition: buttonTransition,
  '&:hover': {
    transform: 'translateY(-2px)',
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  '&:active': {
    transform: 'translateY(0)',
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    boxShadow: 'none',
  },
});

export default function Hero() {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Box
      id="home"
      component="section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 8, md: 12 },
      }}
    >
      <AnimatedBackground />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Hi, I&apos;m Shevon
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.5rem' },
                fontWeight: 500,
                lineHeight: { xs: 1.45, md: 1.3 },
                mb: 3,
                maxWidth: { md: '52rem' },
                color: theme.palette.text.secondary,
              }}
            >
              Full-Stack Engineer specializing in React, Next.js, React Native, and NestJS.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: { xs: 1.65, md: 1.6 },
                mb: 4,
                maxWidth: { xs: '100%', md: '680px' },
                color: theme.palette.text.secondary,
              }}
            >
              I build scalable web and mobile applications, from customer-facing platforms to
              business-critical systems. My work spans responsive web apps, mobile experiences,
              APIs, authentication, subscriptions, and cloud deployments.
            </Typography>
          </motion.div>

          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2 },
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
              },
            }}
          >
            <Button
              variant="contained"
              disableElevation
              size="large"
              startIcon={<VisibilityIcon />}
              onClick={() => {
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={primaryButtonSx(theme)}
            >
              View My Work
            </Button>

            <Button
              component={Link}
              variant="outlined"
              size="large"
              startIcon={<DescriptionOutlinedIcon />}
              href="/resume"
              sx={secondaryButtonSx(theme)}
            >
              View Resume
            </Button>
          </Box>

          <motion.div
            variants={itemVariants}
            style={{
              marginTop: '4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Box
              sx={{
                width: '40px',
                height: '64px',
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: '20px',
                position: 'relative',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <motion.div
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '8px',
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                display: { xs: 'none', md: 'block' },
              }}
            >
              Scroll to explore
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
} 