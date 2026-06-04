import type { Metadata } from 'next';
import { Box } from '@mui/material';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ResumeView from '@/components/Resume/ResumeView';

export const metadata: Metadata = {
  title: 'Resume | Shevon Chisholm',
  description: 'Preview and download Shevon Chisholm’s resume.',
};

export default function ResumePage() {
  return (
    <Box>
      <Navbar />
      <ResumeView />
      <Footer />
    </Box>
  );
}
