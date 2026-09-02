import React, { useState, useEffect } from 'react';
import { Code2, Play, Cpu, Sparkles, Trophy, Award, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 'write',
    title: 'WRITE CODE',
    icon: Code2,
    color: '#3b82f6',
    desc: 'Craft solutions in C++, Python, JavaScript, Java, Rust, or Go with Monaco Editor & real-time syntax highlighting.',
    preview: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    id: 'execute',
    title: 'EXECUTE',
    icon: Play,
    color: '#06b6d4',
    desc: 'Run code instantly inside isolated Docker containers with automated test-case evaluation.',
    preview: `▶ Compiling JavaScript...
✓ Test Case 1 Passed (12ms, 14.2 MB)
✓ Test Case 2 Passed (9ms, 14.1 MB)
✓ Test Case 3 Passed (14ms, 14.5 MB)
Status: ACCEPTED ✓`,
  },
  {
    id: 'analyze',
    title: 'ANALYZE',
    icon: Cpu,
    color: '#10b981',
    desc: 'Receive instant AI Code Intelligence outputting Big-O Time & Space complexity metrics.',
    preview: `📊 Complexity Analysis:
• Time Complexity:  O(N) — Linear scan using HashMap
• Space Complexity: O(N) — Additional hash table storage
• Quality Score:    96/100
• Readability:      Excellent`,
  },
  {
    id: 'improve',
    title: 'IMPROVE',
    icon: Sparkles,
    color: '#8b5cf6',
    desc: 'Get automated AI code rewrites and structural optimizations tailored for top tech interviews.',
    preview: `✨ Optimized Code Refactor:
// Using Two Pointers for space optimization O(1)
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    sum < target ? left++ : right--;
  }
}`,
  },
  {
    id: 'compete',
    title: 'COMPETE',
    icon: Trophy,
    color: '#f59e0b',
    desc: 'Join weekly global coding contests, battle developers worldwide, and climb the live leaderboards.',
    preview: `🏆 Weekly Contest #142:
Rank #1 — @alex_coder   | 4/4 Solved | 18m 42s
Rank #2 — @dev_samiran  | 4/4 Solved | 21m 05s
Rank #3 — @code_master  | 4/4 Solved | 24m 30s`,
  },
  {
    id: 'master',
    title: 'MASTER',
    icon: Award,
    color: '#f43f5e',
    desc: 'Unlock skill badges, build a high-performance streak graph, and land your dream tech role.',
    preview: `🎉 Mastery Profile:
• Solved Problems: 420+
• Current Streak:   28 Days 🔥
• Target Rating:   2150 (Knight)
• Verified Skills: Algorithms, System Design`,
  },
];

export const InteractiveStoryline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = steps[activeStep];

  return (
    <div className="storyline-container" style={{ margin: '4rem 0' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-pill" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#38bdf8', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          VISUAL WORKFLOW
        </span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.8rem' }}>
          From <span className="text-gradient-blue">First Line</span> to <span className="text-gradient-cyan">Mastery</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Explore the end-to-end execution lifecycle powered by JudgeX.
        </p>
      </div>

      {/* Step Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStep;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.2rem',
                borderRadius: '12px',
                background: isActive ? `${step.color}22` : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${isActive ? step.color : 'rgba(255, 255, 255, 0.08)'}`,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 4px 20px ${step.color}33` : 'none',
              }}
            >
              <Icon size={16} color={isActive ? step.color : '#94a3b8'} />
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Display Stage Container */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          padding: '2.5rem',
          alignItems: 'center',
          borderColor: current.color,
          boxShadow: `0 20px 50px -15px ${current.color}25`,
        }}
      >
        {/* Left Column: Description */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '12px', background: `${current.color}20` }}>
              <current.icon size={28} color={current.color} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: current.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                STAGE 0{activeStep + 1}
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{current.title}</h3>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            {current.desc}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: current.color, fontWeight: 600 }}>
            <span>Explore Feature</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Right Column: Code/Log Preview */}
        <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <pre style={{ fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {current.preview}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InteractiveStoryline;
