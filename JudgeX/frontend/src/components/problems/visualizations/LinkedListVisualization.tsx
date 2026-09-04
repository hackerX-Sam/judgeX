import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, ArrowRight } from 'lucide-react';

interface Props {
  elements?: any[];
}

export default function LinkedListVisualization({ elements = [10, 20, 30, 40, 50] }: Props) {
  const nodes = Array.isArray(elements) && elements.length > 0 ? elements : [10, 20, 30, 40, 50];
  const [currIdx, setCurrIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrIdx(prev => {
          if (prev >= nodes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nodes.length]);

  const handleStep = () => {
    setIsPlaying(false);
    setCurrIdx(prev => (prev < nodes.length - 1 ? prev + 1 : 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrIdx(0);
  };

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">Singly Linked List Traversal</span>
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
          Current Node: <code>head-{currIdx}</code> = <strong>{JSON.stringify(nodes[currIdx])}</strong>
        </span>
      </div>

      {/* Linked List Nodes Row */}
      <div className="linked-list-row">
        {nodes.map((val, idx) => {
          const isCurr = idx === currIdx;

          return (
            <React.Fragment key={idx}>
              <div className={`ll-node-box ${isCurr ? 'active' : ''}`}>
                <div className="ll-val">{JSON.stringify(val)}</div>
                <div className="ll-next">next</div>
                {isCurr && <span className="ll-curr-pointer">curr</span>}
              </div>

              {idx < nodes.length - 1 ? (
                <div className="ll-arrow">
                  <ArrowRight size={20} color="#38bdf8" />
                </div>
              ) : (
                <div className="ll-null-badge">NULL</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
