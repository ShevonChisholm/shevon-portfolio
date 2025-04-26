import { Box, Typography, useTheme } from '@mui/material';
import { m as motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

interface SkillProgressProps {
  name: string;
  level: number;
  icon: React.ReactNode;
}

export default function SkillProgress({ name, level, icon }: SkillProgressProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box
          sx={{
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.primary.main,
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            ml: 'auto',
            color: theme.palette.text.secondary,
          }}
        >
          {level}%
        </Typography>
      </Box>
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          }}
        />
      </Box>
    </Box>
  );
} 