'use client';

import { Container, Grid, Typography } from '@mui/material';
import { m as motion } from 'framer-motion';
import {
  Code as CodeIcon,
  Language as WebIcon,
  PhoneAndroid as MobileIcon,
  Html as HtmlIcon,
  Javascript as JavascriptIcon,
  Code as ReactIcon
} from '@mui/icons-material';
import SkillProgress from '../SkillProgress/SkillProgress';

interface SkillCategory {
  title: string;
  icon: React.ReactElement;
  skills: {
    name: string;
    level: number;
    icon: React.ReactElement;
  }[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Development',
    icon: <WebIcon />,
    skills: [
      { name: 'Next.js', level: 90, icon: <ReactIcon /> },
      { name: 'React', level: 90, icon: <ReactIcon /> },
      { name: 'TypeScript', level: 85, icon: <JavascriptIcon /> },
      { name: 'JavaScript', level: 90, icon: <JavascriptIcon /> },
      { name: 'HTML/CSS', level: 95, icon: <HtmlIcon /> },
    ],
  },
  {
    title: 'Backend Development',
    icon: <CodeIcon />,
    skills: [
      { name: 'NestJS', level: 85, icon: <CodeIcon /> },
      { name: 'Node.js', level: 85, icon: <CodeIcon /> },
      { name: 'RESTful APIs', level: 90, icon: <CodeIcon /> },
      { name: 'MongoDB', level: 85, icon: <CodeIcon /> },
      { name: 'AWS', level: 80, icon: <CodeIcon /> },
    ],
  },
  {
    title: 'Mobile & Design',
    icon: <MobileIcon />,
    skills: [
      { name: 'React Native', level: 90, icon: <MobileIcon /> },
      { name: 'Expo', level: 85, icon: <MobileIcon /> },
      { name: 'Responsive Design', level: 95, icon: <CodeIcon /> },
    ],
  },
];

const Skills = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }} id="skills">
      <Typography variant="h2" component="h2" align="center" gutterBottom>
        Skills
      </Typography>
      <Grid container spacing={4}>
        {skillCategories.map((category) => (
          <Grid key={category.title} size={{xs: 12, md: 4}}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h4" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {category.icon}
                {category.title}
              </Typography>
              {category.skills.map((skill) => (
                <SkillProgress
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  icon={skill.icon}
                />
              ))}
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Skills; 