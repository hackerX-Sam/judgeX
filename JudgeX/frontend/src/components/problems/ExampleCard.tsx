import React, { useState } from 'react';
import { Copy, Check, Terminal, FileText } from 'lucide-react';
import type { ParsedExample } from '../../services/problemParser';

interface Props {
  example: ParsedExample;
}

export default function ExampleCard({ example }: Props) {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const copyToClipboard = (text: string, type: 'input' | 'output') => {
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  return (
    <div className="example-card-wrapper">
      <div className="example-card-header">
        <div className="example-badge">
          <Terminal size={14} color="#38bdf8" />
          <span>Example {example.id}</span>
        </div>
      </div>

      <div className="example-card-body">
        {/* Input Block */}
        <div className="io-field-container">
          <div className="io-label-bar">
            <span className="io-label">INPUT</span>
            <button 
              onClick={() => copyToClipboard(example.input, 'input')} 
              className="copy-btn"
              title="Copy input string"
            >
              {copiedInput ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedInput ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="io-code-block">{example.input}</pre>
        </div>

        {/* Output Block */}
        <div className="io-field-container">
          <div className="io-label-bar">
            <span className="io-label output-label">OUTPUT</span>
            <button 
              onClick={() => copyToClipboard(example.output, 'output')} 
              className="copy-btn"
              title="Copy output string"
            >
              {copiedOutput ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedOutput ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="io-code-block output-code">{example.output}</pre>
        </div>

        {/* Explanation Block */}
        {example.explanation && (
          <div className="io-explanation-container">
            <div className="explanation-label">
              <FileText size={13} color="#a855f7" />
              <span>Explanation</span>
            </div>
            <div className="explanation-text">{example.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
