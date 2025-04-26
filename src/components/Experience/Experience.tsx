'use client';

import { Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { Work as WorkIcon } from '@mui/icons-material';
import { m as motion } from 'framer-motion';

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string;
}

const experiences: ExperienceItem[] = [
  {
    title: "React Native & Web Developer",
    company: "Cenedex Software Solutions",
    period: "09/2022 - Present",
    description: "Developed and maintained multiple web and mobile applications using React, React Native, and modern web technologies. Specialized in creating responsive and user-friendly interfaces while ensuring high-quality code standards."
  },
  {
    title: "Freelance Web Developer",
    company: "Self-Employed",
    period: "01/2022 - Present",
    description: "Design and develop custom websites and web applications for various clients. Implement responsive designs, integrate APIs, and provide ongoing maintenance and support. Work closely with clients to understand requirements and deliver solutions that meet their needs."
  }
];

export default function Experience() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h2" align="center" gutterBottom>
        Experience
      </Typography>
      <Timeline 
        position={isMobile ? "right" : "alternate"}
        sx={{
          p: 0,
          [`& .MuiTimelineItem-root`]: {
            minHeight: 'auto',
            '&:before': {
              // This removes the padding on mobile that causes misalignment
              [theme.breakpoints.down('sm')]: {
                display: 'none',
              },
            },
          },
          [`& .MuiTimelineContent-root`]: {
            px: { xs: 2, sm: 3 },
            py: 1,
          },
          [`& .MuiTimelineOppositeContent-root`]: {
            px: { xs: 1, sm: 3 },
            py: 1,
            flex: { xs: 0.2, sm: 0.4 },
          },
        }}
      >
        {experiences.map((exp, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent 
              color="text.secondary"
              sx={{
                typography: { xs: 'body2', sm: 'body1' },
              }}
            >
              {exp.period}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <TimelineDot color="primary">
                  <WorkIcon />
                </TimelineDot>
              </motion.div>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <motion.div
                initial={{ opacity: 0, x: isMobile ? 50 : (index % 2 === 0 ? 50 : -50) }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    lineHeight: { xs: 1.4, sm: 1.5 },
                    mb: 0.5,
                  }}
                >
                  {exp.title}
                </Typography>
                <Typography 
                  color="primary" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    mb: 1,
                  }}
                >
                  {exp.company}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.5, sm: 1.6 },
                  }}
                >
                  {exp.description}
                </Typography>
              </motion.div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
} 