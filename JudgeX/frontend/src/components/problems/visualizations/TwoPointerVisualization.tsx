import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
  target?: any;
}

export default function TwoPointerVisualization({ elements = [2, 7, 11, 15], target = 9 }: Props) {
  const arr = Array.isArray(elements) && elements.length > 0 ? elements : [2, 7, 11, 15];

  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(arr.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(1);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (left < right) {
          const sum = Number(arr[left]) + Number(arr[right]);
          if (sum === Number(target)) {
            setIsPlaying(false);
          } else if (sum < Number(target)) {
            setLeft(prev => prev + 1);
            setStepCount(s => s + 1);
          } else {
            setRight(prev => prev - 1);
            setStepCount(s => s + 1);
          }
        } else {
          setIsPlaying(false);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, left, right, arr, target]);

  const handleReset = () => {
    setIsPlaying(false);
    setLeft(0);
    setRight(arr.length - 1);
    setStepCount(1);
  };

  const handleStep = () => {
    if (left < right) {
      const sum = Number(arr[left]) + Number(arr[right]);
      if (sum < Number(target)) {
        setLeft(prev => prev + 1);
      } else {
        setRight(prev => prev - 1);
      }
      setStepCount(s => s + 1);
    } else {
      handleReset();
    }
  };

  const currentSum = Number(arr[left]) + Number(arr[right]);
  const isMatch = target !== undefined && currentSum === Number(target);

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">Two Pointer Technique</span>
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
          Step {stepCount}: <code>Left</code> [{left}] ({arr[left]}) + <code>Right</code> [{right}] ({arr[right]}) = <strong>{currentSum}</strong>
        </span>
        {target !== undefined && (
          <span className={`target-badge ${isMatch ? 'match' : ''}`}>
            Target: {target} {isMatch ? '✓ Target Sum Match!' : ''}
          </span>
        )}
      </div>

      {/* Array Row with L and R Pointers */}
      <div className="array-vis-grid">
        {arr.map((val, idx) => {
          const isLeft = idx === left;
          const isRight = idx === right;
          const isBetween = idx >= left && idx <= right;

          return (
            <div key={idx} className={`array-node ${isLeft || isRight ? 'active' : isBetween ? 'inspected' : ''}`}>
              <div className="array-index">idx [{idx}]</div>
              <div className="array-value">{JSON.stringify(val)}</div>

              <div className="pointer-container">
                {isLeft && <span className="pointer-pill left-pointer">L</span>}
                {isRight && <span className="pointer-pill right-pointer">R</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
