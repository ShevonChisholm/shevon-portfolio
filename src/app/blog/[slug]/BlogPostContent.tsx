'use client';

import { Container, Typography, Box, Chip } from '@mui/material';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { BlogPost } from '@/data/blogPosts';

interface BlogPostContentProps {
  post: BlogPost;
  children: React.ReactNode;
}

export default function BlogPostContent({ post, children }: BlogPostContentProps) {
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
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }
        }}
      >
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
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