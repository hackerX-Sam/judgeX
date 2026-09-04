import React from 'react';
import { ArrowDown, CheckCircle2, GitBranch } from 'lucide-react';
import type { ParsedProblem } from '../../services/problemParser';

interface Props {
  problem: ParsedProblem;
}

export default function FlowchartSection({ problem }: Props) {
  // Generate dynamic flowchart steps based on visualization type & topics
  const generateSteps = () => {
    const type = problem.visualizationType;

    if (type === 'two-pointer') {
      return [
        { label: 'START', type: 'start' },
        { label: 'Sort array if necessary & initialize Left = 0, Right = N - 1', type: 'process' },
        { label: 'Calculate sum = nums[Left] + nums[Right]', type: 'process' },
        { label: 'Is sum == target?', type: 'condition' },
        { label: 'YES: Return indices [Left, Right]', type: 'success' },
        { label: 'NO: If sum < target move Left++; else move Right--', type: 'process' },
        { label: 'Repeat loop until Left >= Right', type: 'loop' },
        { label: 'END', type: 'end' }
      ];
    } else if (type === 'binary-search') {
      return [
        { label: 'START', type: 'start' },
        { label: 'Initialize Low = 0, High = N - 1 in sorted array', type: 'process' },
        { label: 'Calculate Mid = (Low + High) / 2', type: 'process' },
        { label: 'Is array[Mid] == target?', type: 'condition' },
        { label: 'YES: Return Mid index', type: 'success' },
        { label: 'NO: If array[Mid] < target set Low = Mid + 1; else High = Mid - 1', type: 'process' },
        { label: 'Repeat while Low <= High', type: 'loop' },
        { label: 'END: Return -1 if not found', type: 'end' }
      ];
    } else if (type === 'tree') {
      return [
        { label: 'START', type: 'start' },
        { label: 'Pass root node to traversal function (DFS / BFS)', type: 'process' },
        { label: 'Base Case: Is node == null?', type: 'condition' },
        { label: 'YES: Return base value', type: 'process' },
        { label: 'Recursively process left subtree and right subtree', type: 'process' },
        { label: 'Combine subtree results & return answer', type: 'success' },
        { label: 'END', type: 'end' }
      ];
    } else if (type === 'dp') {
      return [
        { label: 'START', type: 'start' },
        { label: 'Define DP state table dp[i] or dp[i][j]', type: 'process' },
        { label: 'Initialize base cases (e.g. dp[0] = 0 or 1)', type: 'process' },
        { label: 'Iterate state transitions: dp[i] = f(dp[i-1], dp[i-2])', type: 'loop' },
        { label: 'Return final table answer dp[N]', type: 'success' },
        { label: 'END', type: 'end' }
      ];
    }

    // Default Algorithm Flow
    return [
      { label: 'START', type: 'start' },
      { label: 'Read and validate input constraints', type: 'process' },
      { label: 'Initialize data structures (Hash Map / Array / Pointers)', type: 'process' },
      { label: 'Iterate through data elements step-by-step', type: 'loop' },
      { label: 'Condition satisfied?', type: 'condition' },
      { label: 'YES: Return formatted solution', type: 'success' },
      { label: 'END', type: 'end' }
    ];
  };

  const steps = generateSteps();

  return (
    <div className="flowchart-box">
      <div className="flowchart-header">
        <GitBranch size={16} color="#38bdf8" />
        <span>Algorithmic Logic Flowchart</span>
      </div>

      <div className="flowchart-steps-container">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className={`flow-step-node node-${step.type}`}>
              {step.type === 'success' && <CheckCircle2 size={14} color="#10b981" className="step-icon" />}
              <span className="step-label">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flow-arrow">
                <ArrowDown size={14} color="#64748b" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
