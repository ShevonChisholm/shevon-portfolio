import type { Metadata } from 'next';
import { Box } from '@mui/material';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ResumeView from '@/components/Resume/ResumeView';
import { getPublicPortfolioContactSettings } from '@/lib/cms/public-settings';
import { fallbackPortfolioContactSettings } from '@/lib/cms/settings-shared';
import { withPublicFallback } from '@/lib/cms/public-safe';

export const metadata: Metadata = {
  title: 'Resume | Shevon Chisholm',
  description: 'Preview and download Shevon Chisholm’s resume.',
};

export default async function ResumePage() {
  const settings = await withPublicFallback(
    'resume settings',
    getPublicPortfolioContactSettings,
    fallbackPortfolioContactSettings
  );

  return (
    <Box>
      <Navbar />
      <ResumeView resume={settings.resume} />
      <Footer />
    </Box>
  );
}
