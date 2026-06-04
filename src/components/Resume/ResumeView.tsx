'use client';

import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useRouter } from 'next/navigation';

const RESUME_URL = '/resume.pdf';

export default function ResumeView() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        pt: { xs: 10, md: 12 },
        pb: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton
            onClick={() => router.push('/')}
            aria-label="Back to home"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { color: theme.palette.primary.main },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Back to portfolio
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Resume
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Preview below, or download when you&apos;re ready.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              Open in new tab
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              href={RESUME_URL}
              download
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 2px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
                },
              }}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <Box
            component="iframe"
            src={RESUME_URL}
            title="Shevon Chisholm resume preview"
            sx={{
              display: 'block',
              width: '100%',
              minHeight: { xs: '70vh', md: '80vh' },
              border: 0,
              bgcolor: theme.palette.background.default,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
