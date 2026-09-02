import React, { useRef, useState } from 'react';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.25)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8; // 3D tilt max 8deg
    const rotateY = ((x - centerX) / centerX) * 8;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`,
      transition: 'transform 0.1s ease-out',
    });

    setSpotlightPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`glass-card ${className}`}
      style={{
        ...style,
        position: 'relative',
        background: isHovered
          ? `radial-gradient(600px circle at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 40%), rgba(15, 23, 42, 0.75)`
          : 'rgba(15, 23, 42, 0.7)',
        boxShadow: isHovered ? `0 20px 40px -15px ${glowColor}` : '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default MagneticCard;
