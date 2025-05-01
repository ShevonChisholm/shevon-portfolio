'use client';

import { Box, Container, IconButton, Typography, Link } from '@mui/material';
import { LinkedIn as LinkedInIcon, Instagram as InstagramIcon } from '@mui/icons-material';
import { m as motion } from 'framer-motion';

const socialLinks = [
  {
    icon: <LinkedInIcon />,
    url: 'https://linkedin.com/in/shevon-chisholm-6ba802230',
    label: 'LinkedIn'
  },
  {
    icon: <InstagramIcon />,
    url: 'https://instagram.com/sccodealchemist',
    label: 'Instagram'
  }
 
];

const quickLinks = [
  { name: 'Home', href: '#' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' }
];

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        py: 6,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Social Links */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{ mx: 1 }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          {/* Quick Links */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {quickLinks.map((link) => (
              <Box key={link.name} sx={{ mx: 2 }}>
                <Link
                  href={link.href}
                  color="text.secondary"
                  underline="hover"
                >
                  {link.name}
                </Link>
              </Box>
            ))}
          </Box>

          {/* Copyright */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
          >
            © {new Date().getFullYear()} SC | Code Alchemist. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
} 