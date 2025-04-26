'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, useTheme, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Shevon's ability to transform complex requirements into elegant, user-friendly solutions is remarkable. Their technical expertise and attention to detail made our project a success.",
    author: "Sarah Johnson",
    role: "Product Manager at TechCorp"
  },
  {
    quote: "Working with Shevon was a game-changer for our startup. They delivered a robust, scalable application that exceeded our expectations.",
    author: "Michael Chen",
    role: "CTO at InnovateLabs"
  },
  {
    quote: "Not only is Shevon technically proficient, but they also bring creative solutions to the table. Their full-stack expertise helped us deliver a seamless user experience.",
    author: "Emily Rodriguez",
    role: "Lead Designer at DesignHub"
  }
];

export default function TestimonialCarousel() {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 2, md: 8 },
      }}
    >
      <FormatQuoteIcon
        sx={{
          fontSize: '4rem',
          color: theme.palette.primary.main,
          opacity: 0.2,
          mb: 2,
        }}
      />
      
      <Box sx={{ height: '200px', width: '100%', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <m.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontStyle: 'italic',
                mb: 3,
                color: theme.palette.text.primary,
              }}
            >
              {testimonials[currentIndex].quote}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              {testimonials[currentIndex].author}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              {testimonials[currentIndex].role}
            </Typography>
          </m.div>
        </AnimatePresence>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <IconButton
          onClick={handlePrevious}
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <NavigateBeforeIcon />
        </IconButton>
        {testimonials.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                index === currentIndex
                  ? theme.palette.primary.main
                  : theme.palette.primary.main + '40',
              transition: 'all 0.3s ease-in-out',
            }}
          />
        ))}
        <IconButton
          onClick={handleNext}
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
    </Box>
  );
} 