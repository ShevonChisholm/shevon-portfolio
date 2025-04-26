import { Box } from '@mui/material';
import Image from 'next/image';

interface MobileAppScreensProps {
  images: string[];
  title: string;
}

export default function MobileAppScreens({ images, title }: MobileAppScreensProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        p: 2
      }}
    >
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: 'relative',
            width: `${100 / images.length}%`,
            height: '100%',
            transform: index === 1 ? 'translateY(-20px)' : 
                      index === 2 ? 'translateY(20px)' : 
                      index === 3 ? 'translateY(-10px)' : 'none',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
              zIndex: 1
            }
          }}
        >
          <Image
            src={image}
            alt={`${title} screen ${index + 1}`}
            fill
            style={{
              objectFit: 'contain',
              padding: '8px'
            }}
          />
        </Box>
      ))}
    </Box>
  );
} 