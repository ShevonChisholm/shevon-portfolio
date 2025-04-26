import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Experience from '@/components/Experience/Experience';
import Education from '@/components/Education/Education';
import Skills from '@/components/Skills/Skills';
import Projects from '@/components/Projects/Projects';
import Blog from '@/components/Blog/Blog';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';
import { Box } from '@mui/material';

export default function Home() {
  return (
    <Box component="main">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Education />
      <Skills />
      <Projects />
      <Blog />
      <Contact />
      <Footer />
    </Box>
  );
}
