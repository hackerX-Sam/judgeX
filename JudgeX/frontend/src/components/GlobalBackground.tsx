import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import GridScan from './GridScan/GridScan';
import ComputationalCanvas from './ComputationalCanvas';
import CodeDnaCanvas from './CodeDnaCanvas';

export const GlobalBackground: React.FC = () => {
  const { bgMode } = useTheme();

  if (bgMode === 'none') return null;

  if (bgMode === 'classic') {
    return (
      <div 
        className="global-bg-container classic"
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 0, 
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <ComputationalCanvas />
        <CodeDnaCanvas />
      </div>
    );
  }

  // Default: 'gridscan'
  return (
    <div 
      className="global-bg-container gridscan-active"
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <GridScan
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#1E2640"
        scanColor="#38bdf8"
        scanOpacity={0.10}
        gridScale={0.1}
        lineStyle="solid"
        lineJitter={0.1}
        scanDirection="pingpong"
        enablePost={true}
        bloomIntensity={0.10}
        bloomThreshold={0}
        bloomSmoothing={0}
        chromaticAberration={0.0005}
        noiseIntensity={0.003}
        scanGlow={0.15}
        scanSoftness={2}
        scanPhaseTaper={0.9}
        scanDuration={3.2}
        scanDelay={1.5}
        enableGyro={false}
        scanOnClick={true}
        snapBackDelay={250}
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};

export default GlobalBackground;
