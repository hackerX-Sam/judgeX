import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
}

export default function DPMatrixVisualization({ elements = [1, 2, 3, 4] }: Props) {
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const rows = 4;
  const cols = 4;

  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveCell(prev => {
          let nextC = prev.c + 1;
          let nextR = prev.r;
          if (nextC >= cols) {
            nextC = 0;
            nextR = prev.r + 1;
          }
          if (nextR >= rows) {
            setIsPlaying(false);
            return prev;
          }
          return { r: nextR, c: nextC };
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleStep = () => {
    setIsPlaying(false);
    setActiveCell(prev => {
      let nextC = prev.c + 1;
      let nextR = prev.r;
      if (nextC >= cols) {
        nextC = 0;
        nextR = prev.r + 1;
      }
      if (nextR >= rows) {
        return { r: 0, c: 0 };
      }
      return { r: nextR, c: nextC };
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveCell({ r: 0, c: 0 });
  };

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">DP Memoization Table (2D Matrix)</span>
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
          Computing DP Table state <code>dp[{activeCell.r}][{activeCell.c}]</code>
        </span>
      </div>

      <div className="dp-grid-matrix">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="dp-matrix-row">
            {Array.from({ length: cols }).map((_, c) => {
              const isCurrent = activeCell.r === r && activeCell.c === c;
              const isComputed = r < activeCell.r || (r === activeCell.r && c <= activeCell.c);
              const val = isComputed ? (r + 1) * (c + 1) : 0;

              return (
                <div key={c} className={`dp-cell ${isCurrent ? 'active' : isComputed ? 'computed' : ''}`}>
                  <div className="dp-cell-idx">{r},{c}</div>
                  <div className="dp-cell-val">{isComputed ? val : '?'}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
