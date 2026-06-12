export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,102,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.055) 1px, transparent 1px)',
        backgroundSize: '88px 88px',
        maskImage: 'linear-gradient(to bottom, black 18%, transparent 92%)',
      }}
    />
  );
}
