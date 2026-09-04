import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
  target?: any;
}

export default function BinarySearchVisualization({ elements = [1, 3, 5, 7, 9, 11, 13, 15], target = 7 }: Props) {
  const arr = Array.isArray(elements) && elements.length > 0 ? elements : [1, 3, 5, 7, 9, 11, 13, 15];
  
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(arr.length - 1);
  const [mid, setMid] = useState(Math.floor((0 + arr.length - 1) / 2));
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (low <= high && foundIndex === null) {
          const m = Math.floor((low + high) / 2);
          setMid(m);
          const midVal = Number(arr[m]);
          const targetVal = Number(target !== undefined ? target : 7);

          if (midVal === targetVal) {
            setFoundIndex(m);
            setIsPlaying(false);
          } else if (midVal < targetVal) {
            setLow(m + 1);
            setStepCount(s => s + 1);
          } else {
            setHigh(m - 1);
            setStepCount(s => s + 1);
          }
        } else {
          setIsPlaying(false);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, low, high, arr, target, foundIndex]);

  const handleReset = () => {
    setIsPlaying(false);
    setLow(0);
    setHigh(arr.length - 1);
    setMid(Math.floor((0 + arr.length - 1) / 2));
    setFoundIndex(null);
    setStepCount(1);
  };

  const handleStep = () => {
    if (low <= high && foundIndex === null) {
      const m = Math.floor((low + high) / 2);
      setMid(m);
      const midVal = Number(arr[m]);
      const targetVal = Number(target !== undefined ? target : 7);

      if (midVal === targetVal) {
        setFoundIndex(m);
      } else if (midVal < targetVal) {
        setLow(m + 1);
      } else {
        setHigh(m - 1);
      }
      setStepCount(s => s + 1);
    } else {
      handleReset();
    }
  };

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">Binary Search Visualizer</span>
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
          Step {stepCount}: <code>Low</code> = {low}, <code>Mid</code> = {mid} ({arr[mid]}), <code>High</code> = {high}
        </span>
        <span className={`target-badge ${foundIndex !== null ? 'match' : ''}`}>
          Target: {target !== undefined ? target : 7} {foundIndex !== null ? `✓ Found at Index [${foundIndex}]` : ''}
        </span>
      </div>

      {/* Sorted Array Row */}
      <div className="array-vis-grid">
        {arr.map((val, idx) => {
          const isMid = idx === mid;
          const isLow = idx === low;
          const isHigh = idx === high;
          const inRange = idx >= low && idx <= high;

          return (
            <div 
              key={idx} 
              className={`array-node ${isMid ? 'active' : inRange ? 'inspected' : 'disabled'}`}
              style={{ opacity: inRange ? 1 : 0.4 }}
            >
              <div className="array-index">idx [{idx}]</div>
              <div className="array-value">{JSON.stringify(val)}</div>

              <div className="pointer-container">
                {isLow && <span className="pointer-pill left-pointer">L</span>}
                {isMid && <span className="pointer-pill mid-pointer">M</span>}
                {isHigh && <span className="pointer-pill right-pointer">H</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
