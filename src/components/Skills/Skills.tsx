'use client';

import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { m as motion } from 'framer-motion';
import {
  Web as WebIcon,
  PhoneAndroid as MobileIcon,
  Api as BackendIcon,
  Storage as DatabaseIcon,
  Payment as PaymentsIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';

interface Skill {
  name: string;
  icon?: React.ReactElement;
}

interface SkillCategory {
  title: string;
  icon: React.ReactElement;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Development',
    icon: <WebIcon />,
    skills: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'Material UI' },
      { name: 'Redux Toolkit' },
      { name: 'RTK Query' },
    ],
  },
  {
    title: 'Mobile Development',
    icon: <MobileIcon />,
    skills: [
      { name: 'React Native' },
      { name: 'Expo' },
      { name: 'Mobile UI' },
      { name: 'Responsive Layouts' },
    ],
  },
  {
    title: 'Backend Development',
    icon: <BackendIcon />,
    skills: [
      { name: 'Node.js' },
      { name: 'NestJS' },
      { name: 'Express.js' },
      { name: 'REST APIs' },
      { name: 'API Design' },
      { name: 'Authentication' },
      { name: 'Authorization' },
    ],
  },
  {
    title: 'Database & Data Modeling',
    icon: <DatabaseIcon />,
    skills: [
      { name: 'MongoDB' },
      { name: 'Mongoose' },
      { name: 'Database Schema Design' },
      { name: 'Data Modeling' },
      { name: 'Data Integrity' },
    ],
  },
  {
    title: 'Payments & Integrations',
    icon: <PaymentsIcon />,
    skills: [
      { name: 'Stripe' },
      { name: 'Stripe Webhooks' },
      { name: 'SendGrid' },
      { name: 'Third-Party API Integration' },
    ],
  },
  {
    title: 'Cloud, Tools & Workflow',
    icon: <CloudIcon />,
    skills: [
      { name: 'Vercel' },
      { name: 'Railway' },
      { name: 'MongoDB Atlas' },
      { name: 'AWS S3' },
      { name: 'Git' },
      { name: 'Bitbucket' },
      { name: 'Postman' },
      { name: 'Swagger' },
      { name: 'Code Reviews' },
      { name: 'Debugging' },
    ],
  },
];

export default function Skills() {
  const theme = useTheme();

  return (
    <Container
      maxWidth="lg"
      id="skills"
      sx={{ py: { xs: 5, md: 8 } }}
    >
      <Typography
        variant="h2"
        component="h2"
        align="center"
        gutterBottom
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        Skills
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {skillCategories.map((category, index) => (
          <Grid key={category.title} size={{ xs: 12, sm: 6, lg: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  transition: 'border-color 250ms ease, box-shadow 250ms ease, transform 250ms ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.45),
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    fontWeight: 600,
                    mb: { xs: 1.5, sm: 2 },
                    color: theme.palette.text.primary,
                    '& .MuiSvgIcon-root': {
                      color: theme.palette.primary.main,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    },
                  }}
                >
                  {category.icon}
                  {category.title}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {category.skills.map((skill) => (
                    <Chip
                      key={skill.name}
                      label={skill.name}
                      size="small"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        fontWeight: 500,
                        borderRadius: '8px',
                        color: theme.palette.text.primary,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        transition: 'background-color 200ms ease, border-color 200ms ease, transform 200ms ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.16),
                          borderColor: alpha(theme.palette.primary.main, 0.35),
                          transform: 'translateY(-1px)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
