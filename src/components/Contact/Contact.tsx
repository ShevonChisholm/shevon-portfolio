'use client';

import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { m as motion } from 'framer-motion';

interface ContactInfo {
  icon: React.ReactElement;
  title: string;
  content: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: <EmailIcon />,
    title: "Email",
    content: "chisholmshevon@gmail.com"
  },
  {
    icon: <PhoneIcon />,
    title: "Phone",
    content: "+1 876 514 2426"
  },
  {
    icon: <LocationIcon />,
    title: "Location",
    content: "Jamaica"
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Message sent successfully!',
          severity: 'success'
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }} id="contact">
      <Typography variant="h2" component="h2" align="center" gutterBottom>
        Contact Me
      </Typography>
      
      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid size={{xs: 12, md: 4}}>
          <Box>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{ color: 'primary.main' }}>
                    {info.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {info.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {info.content}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Grid>

        {/* Contact Form */}
        <Grid size={{xs: 12, md: 8}}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Paper elevation={3} sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{xs: 12}}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 