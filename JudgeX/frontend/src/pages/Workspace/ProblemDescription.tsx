import ReactMarkdown from 'react-markdown';

interface Props {
  problem: any;
}

export default function ProblemDescription({ problem }: Props) {
  return (
    <div className="problem-description-container">
      <div className="problem-header">
        <h1>{problem.title}</h1>
        <div className="problem-meta">
          <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span className="limit-badge">⏱ {problem.timeLimit}ms</span>
          <span className="limit-badge">💾 {problem.memoryLimit}MB</span>
        </div>
      </div>
      
      <div className="markdown-content">
        <ReactMarkdown>{problem.description}</ReactMarkdown>
      </div>

      {problem.testCases && problem.testCases.length > 0 && (
        <div className="test-cases-section">
          <h3>Examples</h3>
          {problem.testCases.map((tc: any, index: number) => (
            <div key={tc.id} className="example-card">
              <p><strong>Example {index + 1}:</strong></p>
              <div className="io-block">
                <strong>Input:</strong>
                <pre>{tc.input}</pre>
                <strong>Output:</strong>
                <pre>{tc.expectedOutput}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
