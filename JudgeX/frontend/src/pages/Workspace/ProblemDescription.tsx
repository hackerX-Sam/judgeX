import React from 'react';
import ProblemRenderer from '../../components/problems/ProblemRenderer';

interface Props {
  problem: any;
  isSolved?: boolean;
}

export default function ProblemDescription({ problem, isSolved = false }: Props) {
  if (!problem) return null;

  return (
    <div className="problem-description-container" style={{ padding: '0.5rem', overflowY: 'auto', height: '100%' }}>
      <ProblemRenderer problem={problem} isSolved={isSolved} />
    </div>
  );
}
