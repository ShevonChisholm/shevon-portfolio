import { createTheme, alpha } from '@mui/material/styles';
import { PaletteMode, ThemeOptions } from '@mui/material';

// Import fonts
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#FF6600',
      light: alpha('#FF6600', 0.8),
      dark: alpha('#FF6600', 0.9),
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#424242', // charcoal gray
      light: '#757575',
      dark: '#212121',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#121212',
      paper: mode === 'light' ? '#F5F5F5' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#FFFFFF',
      secondary: mode === 'light' ? '#424242' : '#B0B0B0',
    },
    grey: {
      100: '#F5F5F5', // soft light gray
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242', // charcoal gray
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

// Create the light theme
export const theme = createTheme(getDesignTokens('light'));

// Create the dark theme
export const darkTheme = createTheme(getDesignTokens('dark')); 