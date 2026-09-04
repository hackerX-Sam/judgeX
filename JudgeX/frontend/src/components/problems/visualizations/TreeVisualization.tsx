import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface Props {
  elements?: any[];
}

export default function TreeVisualization({ elements = [3, 9, 20, null, null, 15, 7] }: Props) {
  const treeNodes = Array.isArray(elements) && elements.length > 0 ? elements : [3, 9, 20, null, null, 15, 7];
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter out non-null nodes for step traversal
  const validIndices = treeNodes.map((v, i) => (v !== null ? i : -1)).filter(i => i !== -1);

  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveIdx(prev => {
          const currentPos = validIndices.indexOf(prev);
          if (currentPos >= validIndices.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return validIndices[currentPos + 1];
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, validIndices]);

  const handleStep = () => {
    setIsPlaying(false);
    const currentPos = validIndices.indexOf(activeIdx);
    if (currentPos < validIndices.length - 1) {
      setActiveIdx(validIndices[currentPos + 1]);
    } else {
      setActiveIdx(validIndices[0]);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveIdx(validIndices[0] || 0);
  };

  return (
    <div className="vis-box-container">
      <div className="vis-header-bar">
        <span className="vis-title">Binary Tree Traversal</span>
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
          Visiting Node: <code>node[{activeIdx}]</code> = <strong>{JSON.stringify(treeNodes[activeIdx])}</strong>
        </span>
      </div>

      {/* Tree Visualization SVG Grid */}
      <div className="tree-vis-container">
        <div className="tree-level level-0">
          {treeNodes[0] !== undefined && treeNodes[0] !== null && (
            <div className={`tree-node ${activeIdx === 0 ? 'active' : ''}`}>
              {JSON.stringify(treeNodes[0])}
            </div>
          )}
        </div>

        <div className="tree-level level-1">
          {treeNodes[1] !== undefined && (
            <div className={`tree-node ${activeIdx === 1 ? 'active' : treeNodes[1] === null ? 'null-node' : ''}`}>
              {treeNodes[1] !== null ? JSON.stringify(treeNodes[1]) : 'null'}
            </div>
          )}
          {treeNodes[2] !== undefined && (
            <div className={`tree-node ${activeIdx === 2 ? 'active' : treeNodes[2] === null ? 'null-node' : ''}`}>
              {treeNodes[2] !== null ? JSON.stringify(treeNodes[2]) : 'null'}
            </div>
          )}
        </div>

        <div className="tree-level level-2">
          {treeNodes.slice(3, 7).map((val, i) => {
            const nodeIdx = 3 + i;
            return (
              <div key={nodeIdx} className={`tree-node ${activeIdx === nodeIdx ? 'active' : val === null ? 'null-node' : ''}`}>
                {val !== null ? JSON.stringify(val) : 'null'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
