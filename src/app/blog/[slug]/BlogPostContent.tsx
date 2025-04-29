'use client';

import { Container, Typography, Box, Chip, useTheme } from '@mui/material';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import type { BlogPost } from '@/data/blogPosts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BlogPostContentProps {
  post: BlogPost;
  children: React.ReactNode;
}

const ImageFallback = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        zIndex: 1,
      }}
    >
      <ImageIcon 
        sx={{ 
          fontSize: 64,
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.2)',
        }} 
      />
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
        }}
      >
        Blog image coming soon
      </Typography>
    </Box>
  );
};

export default function BlogPostContent({ post, children }: BlogPostContentProps) {
  const theme = useTheme();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleBackClick = () => {
    // Navigate to home page with the blog hash
    router.push('/#blog');
    
    // After navigation, ensure smooth scrolling to blog section
    setTimeout(() => {
      const element = document.getElementById('blog');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" align="center">
          Post not found
        </Typography>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box 
          onClick={handleBackClick}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.text.secondary,
            cursor: 'pointer',
            mb: 2,
            width: 'fit-content',
            '&:hover': {
              color: theme.palette.primary.main
            }
          }}
        >
          <ArrowBackIcon />
          <Typography>Back to Blog</Typography>
        </Box>
      </Container>

      <Box
        sx={{
          position: 'relative',
          height: '400px',
          width: '100%',
          mb: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: !imageError ? 'rgba(0,0,0,0.5)' : 'transparent',
            zIndex: 1,
          }
        }}
      >
        {!imageError ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageFallback />
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            p: 4,
            color: 'white',
            zIndex: 2,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
              {post.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1">
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 20 }} />
                {post.readTime}
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {post.tags.map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'text.primary',
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            '& h1': {
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 4,
              color: 'text.primary',
            },
            '& h2': {
              fontSize: { xs: '1.5rem', md: '2rem' },
              mb: 3,
              mt: 4,
              color: 'text.primary',
            },
            '& p': {
              fontSize: { xs: '1rem', md: '1.1rem' },
              mb: 2,
              color: 'text.secondary',
              lineHeight: 1.7,
            },
            '& ul, & ol': {
              pl: 4,
              mb: 3,
            },
            '& li': {
              mb: 1,
              color: 'text.secondary',
            },
            '& pre': {
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '& code': {
              fontFamily: 'monospace',
            },
          }}
        >
          {children}
        </Box>
      </Container>
    </motion.div>
  );
} 