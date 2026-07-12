'use client';

import { Box, Button, Chip, Container, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import type { ResumeSettingValue } from '@/types/cms';
import { publicContainerSx } from '@/theme/layout';

const RESUME_URL = '/resume.pdf';

type ResumeViewProps = {
  resume?: ResumeSettingValue | null;
};

export default function ResumeView({ resume }: ResumeViewProps) {
  const theme = useTheme();
  const resumeUrl = resume?.url || RESUME_URL;
  const resumeLabel = resume?.label || 'Shevon Chisholm resume preview';

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 8, md: 10 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="xl" sx={{ ...publicContainerSx, minWidth: 0 }}>
        {/* Back Button */}
        <Link href="/#home" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: { xs: 5, md: 6 },
              cursor: 'pointer',
              width: 'fit-content',
              '&:hover': {
                color: 'primary.main',
                '& svg': { color: 'primary.main' },
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 }}>
              Back to portfolio
            </Typography>
          </Box>
        </Link>

        {/* Header Section */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Chip
            label="RESUME"
            size="small"
            variant="outlined"
            sx={{
              height: 28,
              mb: 3,
              borderRadius: 4,
              color: 'primary.main',
              borderColor: alpha(theme.palette.primary.main, 0.38),
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              fontSize: '0.65rem',
              fontWeight: 800,
            }}
          />

          <Typography
            component="h1"
            sx={{
              mb: 1.5,
              fontFamily: '"Montserrat", sans-serif',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '2.35rem' },
              lineHeight: 1.12,
              fontWeight: 800,
            }}
          >
            Shevon{' '}
            <Box component="span" sx={{ color: 'primary.main', display: { xs: 'block', sm: 'inline' } }}>
              Chisholm
            </Box>
          </Typography>

          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.98rem', md: '1rem' },
              lineHeight: 1.6,
              maxWidth: 600,
            }}
          >
            Preview below, or download when you&apos;re ready.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mb: { xs: 5, md: 6 },
            flexWrap: 'wrap',
          }}
        >
          <Button
            component="a"
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            sx={{
              minHeight: 42,
              px: 2.5,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              },
            }}
          >
            Open in new tab
          </Button>

          <Button
            component="a"
            href={resumeUrl}
            download
            variant="contained"
            disableElevation
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{
              minHeight: 42,
              px: 2.5,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Download PDF
          </Button>
        </Box>

        {/* Resume Preview */}
        <Box
          sx={{
            borderRadius: 1.5,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.25)}`,
          }}
        >
          <Box
            component="iframe"
            src={resumeUrl}
            title={resumeLabel}
            sx={{
              display: 'block',
              width: '100%',
              minHeight: { xs: '600px', sm: '700px', md: '800px' },
              border: 0,
              bgcolor: theme.palette.background.default,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
