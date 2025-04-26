'use client';

import { Box, Card, CardContent, CardMedia, Chip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import MobileAppScreens from '../MobileAppScreens/MobileAppScreens';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  images?: string[];
  tags: string[];
  slug: string;
  category: 'Web Apps' | 'Mobile Apps' | 'All';
}

export default function ProjectCard({ title, description, image, images, tags, slug, category }: ProjectCardProps) {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex' }}
    >
      <Link href={`/projects/${slug}`} style={{ textDecoration: 'none', height: '100%', width: '100%' }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
              '& .project-image': {
                transform: 'scale(1.1)',
              },
            },
          }}
        >
          <Box 
            sx={{ 
              position: 'relative', 
              paddingTop: '56.25%', 
              overflow: 'hidden', 
              flexShrink: 0,
              backgroundColor: category === 'Mobile Apps' ? 'rgba(0,0,0,0.05)' : 'transparent',
            }}
          >
            {category === 'Mobile Apps' && images ? (
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <MobileAppScreens images={images} title={title} />
              </Box>
            ) : (
              <CardMedia
                component="img"
                image={image}
                alt={title}
                className="project-image"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  objectFit: 'cover'
                }}
              />
            )}
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: theme.palette.text.secondary,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flexGrow: 1,
              }}
            >
              {description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 