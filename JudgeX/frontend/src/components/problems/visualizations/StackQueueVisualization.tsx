import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
  mode?: 'stack' | 'queue';
}

export default function StackQueueVisualization({ elements = [10, 20, 30, 40], mode = 'stack' }: Props) {
  const inputElements = Array.isArray(elements) && elements.length > 0 ? elements : [10, 20, 30, 40];
  const [container, setContainer] = useState<any[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= inputElements.length) {
            setIsPlaying(false);
            return prev;
          }
          const nextItem = inputElements[prev];
          if (mode === 'stack') {
            setContainer(c => [nextItem, ...c]);
          } else {
            setContainer(c => [...c, nextItem]);
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, inputElements, mode]);

  const handleStep = () => {
    setIsPlaying(false);
    if (stepIdx < inputElements.length) {
      const nextItem = inputElements[stepIdx];
      if (mode === 'stack') {
        setContainer(c => [nextItem, ...c]);
      } else {
        setContainer(c => [...c, nextItem]);
      }
      setStepIdx(s => s + 1);
    } else {
      setContainer([]);
      setStepIdx(0);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setContainer([]);
    setStepIdx(0);
  };

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">{mode === 'stack' ? 'LIFO Stack Visualizer' : 'FIFO Queue Visualizer'}</span>
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
          Processed {stepIdx} of {inputElements.length} elements {mode === 'stack' ? '(PUSH)' : '(ENQUEUE)'}
        </span>
      </div>

      <div className="sq-container">
        {mode === 'stack' ? (
          <div className="stack-bucket">
            <div className="bucket-label">TOP</div>
            {container.length > 0 ? (
              container.map((item, idx) => (
                <div key={idx} className={`stack-item ${idx === 0 ? 'top-item' : ''}`}>
                  {JSON.stringify(item)}
                </div>
              ))
            ) : (
              <div className="empty-bucket">Stack is Empty</div>
            )}
            <div className="bucket-label">BOTTOM</div>
          </div>
        ) : (
          <div className="queue-row">
            <span className="q-label">FRONT ►</span>
            {container.length > 0 ? (
              container.map((item, idx) => (
                <div key={idx} className="queue-item">
                  {JSON.stringify(item)}
                </div>
              ))
            ) : (
              <div className="empty-bucket">Queue is Empty</div>
            )}
            <span className="q-label">◄ REAR</span>
          </div>
        )}
      </div>
    </div>
  );
}
