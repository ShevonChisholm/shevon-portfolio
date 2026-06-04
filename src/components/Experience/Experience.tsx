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
    title: 'Full Stack Engineer',
    company: 'Wealth Building Investments',
    period: '01/2025 - Present',
    description:
      'Architected and developed a full-stack fintech platform supporting 100+ users, including a customer-facing application, admin portal, and backend API layer. Built secure financial workflows covering balances, transaction tracking, loan repayments, savings contributions, payouts, payment history, Stripe payment synchronization, JWT authentication, and role-based access control.',
  },
  {
    title: 'Full Stack Developer',
    company: '1Dev.ai Software Solutions (formerly Cenedex Software Solutions)',
    period: '09/2022 - Present',
    description:
      'Built full-stack web applications across multiple client and internal projects using React, Next.js, Node.js, NestJS, REST APIs, and database-backed services. Created responsive frontend interfaces, implemented authentication and business logic, designed database schemas, debugged production issues, and collaborated with designers, developers, and stakeholders to deliver production-ready features.',
  },
  {
    title: 'Freelance Web Developer',
    company: 'Self-Employed',
    period: '01/2022 - Present',
    description:
      'Designed and developed custom websites and web applications for clients, translating business requirements into clean, responsive, and maintainable digital solutions. Delivered client-facing websites, API integrations, ongoing maintenance, and usability-focused improvements across healthcare, business, and service-based projects.',
  },
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