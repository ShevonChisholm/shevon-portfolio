'use client';

import { Box, Card, CardContent, Chip, Grid, Typography, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import SectionContainer from '../SectionContainer/SectionContainer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function Blog() {
  const theme = useTheme();

  return (
    <SectionContainer
      id="blog"
      title="Blog"
      subtitle="Sharing insights and experiences from my journey in software development"
    >
      <Grid container spacing={4}>
        {blogPosts.map((post) => (
          <Grid key={post.id} size={{xs: 12, sm: 6, md: 4}}>
            <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', height: 200 }}>
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                      >
                        {format(new Date(post.date), 'MMM d, yyyy')}
                        <Box component="span" sx={{ mx: 1 }}>•</Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          {post.readTime}
                        </Box>
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {post.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {post.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.08)',
                            color: theme.palette.text.primary,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </m.div>
            </Link>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  );
} 