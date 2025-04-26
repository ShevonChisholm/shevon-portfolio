'use client';

import { Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { School as SchoolIcon } from '@mui/icons-material';
import { m as motion } from 'framer-motion';

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

const educationItems: EducationItem[] = [
  {
    degree: "Bachelor of Science (Incomplete)",
    institution: "University of the West Indies",
    period: "2017 - 2022",
    description: "Completed three years of Computer Science education, focusing on Object-Oriented Programming, Software Engineering, Database Management, and Computer Systems. Transitioned to professional certifications due to financial constraints."
  },
  {
    degree: "The Complete 2022 Web Development Bootcamp",
    institution: "Udemy",
    period: "Jul 2022",
    description: "Comprehensive full-stack web development bootcamp covering modern web technologies and best practices. Pursued this certification as part of my transition into professional web development."
  },
  {
    degree: "React + Redux & JavaScript Certifications",
    institution: "Sololearn",
    period: "Sep 2022",
    description: "Advanced training in React, Redux.js, and JavaScript fundamentals, with hands-on project experience and practical application development."
  },
  {
    degree: "Full Stack and Frontend Development",
    institution: "LinkedIn Learning",
    period: "Aug 2022",
    description: "Series of certifications including HTML Essential Training, JavaScript Essential Training, React.js Essential Training, and Web Programming Foundations."
  },
  {
    degree: "UX Design and Accessibility",
    institution: "LinkedIn Learning",
    period: "Aug 2022",
    description: "Comprehensive UX training including UX Design Overview, UX Foundations: Accessibility, User Experience for Web Design, and Planning a Career in User Experience."
  }
];

export default function Education() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography 
        variant="h2" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{
          fontSize: { xs: '2.5rem', sm: '3.75rem' },
          mb: { xs: 4, sm: 6 }
        }}
      >
        Education
      </Typography>
      <Timeline 
        position={isMobile ? "right" : "alternate"}
        sx={{
          p: 0,
          [`& .MuiTimelineItem-root`]: {
            minHeight: { xs: '100px', sm: '120px' }
          },
          [`& .MuiTimelineContent-root`]: {
            py: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3 }
          },
          [`& .MuiTimelineOppositeContent-root`]: {
            flex: { xs: 0.2, sm: 1 },
            py: { xs: 1, sm: 2 }
          }
        }}
      >
        {educationItems.map((edu, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {edu.period}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <TimelineDot color="secondary">
                  <SchoolIcon />
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
                    fontWeight: 600
                  }}
                >
                  {edu.degree}
                </Typography>
                <Typography 
                  color="secondary" 
                  gutterBottom
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  {edu.institution}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.4, sm: 1.5 }
                  }}
                >
                  {edu.description}
                </Typography>
              </motion.div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
} 