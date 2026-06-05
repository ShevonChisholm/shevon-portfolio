import { Box, useMediaQuery, useTheme } from "@mui/material";

interface MobileAppScreensProps {
  images: string[];
  title: string;
}

export default function MobileAppScreens({ images, title }: MobileAppScreensProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!images.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',  // 2 columns on mobile
          sm: 'repeat(4, 1fr)'   // 4 columns on tablet/desktop
        },
        gap: { xs: 2, sm: 1 },
        p: { xs: 1, sm: 2 },
        alignItems: 'center',
        justifyItems: 'center'
      }}
    >
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: 'relative',
            width: '100%',
            // Adjust height based on screen size and grid position
            height: isMobile ? 
              // On mobile: First row taller than second row
              index < 2 ? '280px' : '240px' :
              // On desktop: Alternating heights
              index === 1 ? 'calc(100% - 20px)' : 
              index === 2 ? 'calc(100% + 20px)' : 
              index === 3 ? 'calc(100% - 10px)' : '100%',
            transform: !isMobile ? (
              index === 1 ? 'translateY(-20px)' : 
              index === 2 ? 'translateY(20px)' : 
              index === 3 ? 'translateY(-10px)' : 'none'
            ) : 'none',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              zIndex: 1
            }
          }}
        >
          <Box
            component="img"
            src={image}
            alt={`${title} screen ${index + 1}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: "4px",
            }}
          />
        </Box>
      ))}
    </Box>
  );
} 
