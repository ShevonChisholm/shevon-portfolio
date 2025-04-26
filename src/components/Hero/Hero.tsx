'use client';

import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { m as motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
        pt: { xs: 8, md: 4 },
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
                fontSize: { xs: '1.5rem', md: '2.5rem' },
                fontWeight: 500,
                mb: 3,
                color: theme.palette.text.secondary,
              }}
            >
              Full-Stack Web & Mobile Developer
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                mb: 4,
                maxWidth: '600px',
                color: theme.palette.text.secondary,
              }}
            >
              I craft beautiful, user-friendly applications that solve real-world problems.
              From responsive web apps to native mobile experiences, I bring ideas to life.
            </Typography>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<VisibilityIcon />}
              onClick={() => {
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              View My Work
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<FileDownloadIcon />}
              href="/resume.pdf"
              target="_blank"
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Download Resume
            </Button>
          </motion.div>

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