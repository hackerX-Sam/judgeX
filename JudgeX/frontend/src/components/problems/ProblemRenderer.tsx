import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Code2, ShieldAlert, Cpu, HardDrive, CheckCircle2, Circle, 
  Sparkles, HelpCircle, Tag, Eye, ChevronDown, ChevronUp, PlayCircle, GitBranch
} from 'lucide-react';
import { parseProblem } from '../../services/problemParser';
import type { ParsedProblem } from '../../services/problemParser';
import { getVisualizationComponent } from './visualizations/visualizationRegistry';
import ExampleCard from './ExampleCard';
import FlowchartSection from './FlowchartSection';
import './ProblemRenderer.css';

interface Props {
  problem: any;
  isSolved?: boolean;
}

export default function ProblemRenderer({ problem, isSolved = false }: Props) {
  // Parse raw problem payload through Universal Normalizer
  const parsed: ParsedProblem = useMemo(() => parseProblem(problem), [problem]);

  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'visualization' | 'flowchart' | 'constraints'>('description');
  const [showVisualization, setShowVisualization] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const toggleHint = (idx: number) => {
    setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Get Dynamic Visualization Component
  const VisComponent = getVisualizationComponent(parsed.visualizationType);

  return (
    <div className="universal-problem-renderer">
      {/* 1. Problem Header Box */}
      <div className="u-problem-header">
        <div className="u-header-top">
          <h1 className="u-problem-title">{parsed.title}</h1>
          <div className="u-badge-row">
            <span className={`diff-badge diff-${parsed.difficulty.toLowerCase()}`}>
              {parsed.difficulty}
            </span>

            {isSolved ? (
              <span className="solved-status-pill">
                <CheckCircle2 size={13} /> Solved
              </span>
            ) : (
              <span className="unsolved-status-pill">
                <Circle size={13} /> Todo
              </span>
            )}

            <span className="limit-pill">
              <Cpu size={13} color="#38bdf8" /> {parsed.timeLimit}ms
            </span>
            <span className="limit-pill">
              <HardDrive size={13} color="#06b6d4" /> {parsed.memoryLimit}MB
            </span>
          </div>
        </div>

        {/* Topics / Tags Badges */}
        {parsed.topics.length > 0 && (
          <div className="u-topics-row">
            <Tag size={13} color="#94a3b8" />
            {parsed.topics.map((topic, i) => (
              <span key={i} className="u-topic-tag">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive UX Step Journey Guide */}
      <div className="ux-journey-bar">
        <div className="ux-step active"><span className="step-num">1</span> UNDERSTAND</div>
        <div className="ux-step"><span className="step-num">2</span> READ</div>
        <div className="ux-step"><span className="step-num">3</span> ANALYZE</div>
        <div className="ux-step highlight" onClick={() => setShowVisualization(!showVisualization)}>
          <Sparkles size={13} /> <span className="step-num">4</span> VISUALIZE
        </div>
        <div className="ux-step"><span className="step-num">5</span> THINK</div>
        <div className="ux-step"><span className="step-num">6</span> CODE</div>
        <div className="ux-step"><span className="step-num">7</span> RUN</div>
        <div className="ux-step"><span className="step-num">8</span> SUBMIT</div>
      </div>

      {/* 3. Tab Navigation Header */}
      <div className="u-tab-nav">
        <button 
          className={`u-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          <BookOpen size={15} /> Statement
        </button>

        <button 
          className={`u-tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          <Code2 size={15} /> Examples ({parsed.examples.length})
        </button>

        <button 
          className={`u-tab-btn ${activeTab === 'visualization' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          <Eye size={15} /> Interactive Visualizer
        </button>

        <button 
          className={`u-tab-btn ${activeTab === 'flowchart' ? 'active' : ''}`}
          onClick={() => setActiveTab('flowchart')}
        >
          <GitBranch size={15} /> Flowchart
        </button>

        <button 
          className={`u-tab-btn ${activeTab === 'constraints' ? 'active' : ''}`}
          onClick={() => setActiveTab('constraints')}
        >
          <ShieldAlert size={15} /> Limits & Hints ({parsed.hints.length})
        </button>
      </div>

      {/* 4. Tab 1: Description Statement */}
      {activeTab === 'description' && (
        <div className="u-tab-content fade-in">
          {/* Main Clean Description */}
          <div className="markdown-content">
            <ReactMarkdown>{parsed.cleanDescription || parsed.descriptionHtml}</ReactMarkdown>
          </div>

          {/* Quick Toggleable Visualization Card */}
          <div className="vis-quick-trigger-card">
            <div className="vis-trigger-meta">
              <Sparkles size={18} color="#38bdf8" />
              <div>
                <h4>Interactive Algorithm Visualization Available</h4>
                <p>Visualize problem testcases step-by-step using actual problem data.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowVisualization(!showVisualization)}
              className="vis-toggle-btn"
            >
              <PlayCircle size={15} />
              {showVisualization ? 'Hide Visualizer' : 'Visualize Algorithm'}
              {showVisualization ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Render Visualization Box if toggled */}
          {showVisualization && (
            <div className="vis-embedded-wrapper">
              <VisComponent 
                elements={parsed.visualizationData?.elements} 
                target={parsed.visualizationData?.target} 
              />
            </div>
          )}

          {/* Sample Testcases Preview */}
          <div className="u-section-block" style={{ marginTop: '2rem' }}>
            <h3 className="u-section-title">
              <Code2 size={16} color="#38bdf8" /> Test Case Examples
            </h3>
            <div className="examples-grid">
              {parsed.examples.map((ex) => (
                <ExampleCard key={ex.id} example={ex} />
              ))}
            </div>
          </div>

          {/* Constraints Preview */}
          {parsed.constraints.length > 0 && (
            <div className="u-section-block">
              <h3 className="u-section-title">
                <ShieldAlert size={16} color="#06b6d4" /> Constraints & Boundaries
              </h3>
              <ul className="constraints-list">
                {parsed.constraints.map((c, i) => (
                  <li key={i}>
                    <code>{c}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-Up Section */}
          {parsed.followUp && (
            <div className="followup-card">
              <div className="followup-header">
                <Sparkles size={16} color="#a855f7" />
                <span>Follow-up Challenge</span>
              </div>
              <p className="followup-body">{parsed.followUp}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Examples & Testcases */}
      {activeTab === 'examples' && (
        <div className="u-tab-content fade-in">
          <div className="examples-grid">
            {parsed.examples.map((ex) => (
              <ExampleCard key={ex.id} example={ex} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Visualizer */}
      {activeTab === 'visualization' && (
        <div className="u-tab-content fade-in">
          <VisComponent 
            elements={parsed.visualizationData?.elements} 
            target={parsed.visualizationData?.target} 
          />
        </div>
      )}

      {/* Tab 4: Flowchart */}
      {activeTab === 'flowchart' && (
        <div className="u-tab-content fade-in">
          <FlowchartSection problem={parsed} />
        </div>
      )}

      {/* Tab 5: Limits & Hints */}
      {activeTab === 'constraints' && (
        <div className="u-tab-content fade-in">
          {/* Execution Environment Card */}
          <div className="specs-card">
            <h4>JudgeX Execution Environment Specs</h4>
            <ul>
              <li><strong>CPU Time Limit:</strong> {parsed.timeLimit} ms per test case</li>
              <li><strong>Memory Heap Limit:</strong> {parsed.memoryLimit} MB sandbox memory limit</li>
              <li><strong>Security Sandbox:</strong> Isolated rootless Docker container</li>
            </ul>
          </div>

          {/* Progressive Hints Section */}
          <div className="hints-section">
            <h3 className="u-section-title" style={{ marginTop: '1.5rem' }}>
              <HelpCircle size={16} color="#fbbf24" /> Progressive Hints
            </h3>

            {parsed.hints.length > 0 ? (
              parsed.hints.map((hint, idx) => {
                const isRevealed = !!revealedHints[idx];
                return (
                  <div key={idx} className="hint-card">
                    <div className="hint-header">
                      <span className="hint-title">Hint {idx + 1}</span>
                      <button onClick={() => toggleHint(idx)} className="hint-reveal-btn">
                        {isRevealed ? 'Hide Hint' : 'Reveal Hint'}
                      </button>
                    </div>
                    {isRevealed && <div className="hint-body">{hint}</div>}
                  </div>
                );
              })
            ) : (
              <div className="hint-card">
                <div className="hint-header">
                  <span className="hint-title">Optimization Hint</span>
                  <button onClick={() => toggleHint(0)} className="hint-reveal-btn">
                    {revealedHints[0] ? 'Hide Hint' : 'Reveal Hint'}
                  </button>
                </div>
                {revealedHints[0] && (
                  <div className="hint-body">
                    💡 Consider time and space complexity. Can you optimize brute force solutions using an auxiliary Hash Map or Two Pointers to achieve linear O(N) performance?
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
