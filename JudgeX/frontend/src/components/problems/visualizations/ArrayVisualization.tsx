import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
  target?: any;
}

export default function ArrayVisualization({ elements = [2, 7, 11, 15], target = 9 }: Props) {
  const arr = Array.isArray(elements) && elements.length > 0 ? elements : [2, 7, 11, 15];
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Total steps = number of elements
  const totalSteps = arr.length;

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStep = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : 0));
  };

  const currentVal = arr[currentStep];
  const isMatch = target !== undefined && currentVal == target;

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">Array Element Inspection</span>
        <div className="vis-controls">
          <button onClick={() => setIsPlaying(!isPlaying)} className="vis-btn">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleStep} className="vis-btn">
            <SkipForward size={14} /> Step
          </button>
          <button onClick={handleReset} className="vis-btn secondary">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="vis-step-info">
        <span>
          Step {currentStep + 1} of {totalSteps}: Inspecting index <code>[{currentStep}]</code> = <strong>{JSON.stringify(currentVal)}</strong>
        </span>
        {target !== undefined && (
          <span className={`target-badge ${isMatch ? 'match' : ''}`}>
            Target: {JSON.stringify(target)} {isMatch ? '✓ Match Found' : ''}
          </span>
        )}
      </div>

      {/* Interactive Array Elements Row */}
      <div className="array-vis-grid">
        {arr.map((val, idx) => {
          const isActive = idx === currentStep;
          const isInspected = idx <= currentStep;

          return (
            <div key={idx} className={`array-node ${isActive ? 'active' : isInspected ? 'inspected' : ''}`}>
              <div className="array-index">idx [{idx}]</div>
              <div className="array-value">{JSON.stringify(val)}</div>
              {isActive && <div className="array-pointer">▲</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
