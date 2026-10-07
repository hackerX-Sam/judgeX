import React, { useState } from 'react';
import Folder from './Folder';
import AnimatedCounter from '../AnimatedCounter';
import { Code2, Flame, ShieldCheck, Terminal, FolderOpen, Sparkles, Layers } from 'lucide-react';

export const FolderStats: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const cards = [
    // Card 1: 4,200+ Curated Problems
    <div key="card-1" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
        <Code2 size={22} color="#38bdf8" />
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.5px' }} className="text-gradient-blue">
        <AnimatedCounter end={4200} suffix="+" />
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
        Curated Problems
      </div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
        Algorithms & Data Structures
      </div>
    </div>,

    // Card 2: 125,000+ Submissions Judged
    <div key="card-2" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
        <Flame size={22} color="#06b6d4" />
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.5px' }} className="text-gradient-cyan">
        <AnimatedCounter end={125000} suffix="+" />
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
        Submissions Judged
      </div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
        Real-Time Verdicts
      </div>
    </div>,

    // Card 3: 99.9% Sandbox Uptime
    <div key="card-3" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
        <ShieldCheck size={22} color="#10b981" />
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight 900, letterSpacing: '-0.5px' }} className="text-gradient-emerald">
        <AnimatedCounter end={99.9} suffix="%" />
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
        Sandbox Uptime
      </div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
        Isolated Execution Nodes
      </div>
    </div>,

    // Card 4: 14 Languages Docker Execution Environments
    <div key="card-4" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
        <Terminal size={22} color="#f59e0b" />
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }} className="text-gradient-amber">
        <AnimatedCounter end={14} suffix=" Languages" />
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
        Docker Environments
      </div>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
        C++, Py, Java, Rust & Go
      </div>
    </div>
  ];

  return (
    <section 
      className="folder-stats-section"
      style={{ 
        maxWidth: '1280px', 
        margin: '3rem auto', 
        padding: '2.5rem 1.5rem', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div 
          className="hero-badge" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '0.35rem 0.9rem', 
            borderRadius: '20px', 
            background: 'rgba(59, 130, 246, 0.12)', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            color: '#38bdf8', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            marginBottom: '0.6rem'
          }}
        >
          <Sparkles size={14} />
          <span>SYSTEM VAULT & METRICS</span>
        </div>
        <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          JudgeX Infrastructure <span className="text-gradient-blue">Vault</span>
        </h2>
        <p style={{ color: 'var(--jx-text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
          Click the interactive vault folder below to toggle and inspect platform performance metrics and execution sandboxes.
        </p>
      </div>

      {/* Interactive Folder Container */}
      <div 
        style={{ 
          width: '100%', 
          minHeight: '340px', 
          display: 'flex', 
          alignItems: 'center', 
          justify: 'center', 
          position: 'relative',
          paddingTop: '60px'
        }}
      >
        <Folder
          size={1.25}
          color="#2563eb"
          items={cards}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          badgeContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
              <FolderOpen size={18} color="#ffffff" />
              <span>JudgeX Vault</span>
            </div>
          }
        />
      </div>

      {/* Quick Helper Hint */}
      <div 
        style={{ 
          marginTop: '2.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#94a3b8', 
          fontSize: '0.82rem', 
          background: 'rgba(15, 23, 42, 0.6)', 
          padding: '0.4rem 1rem', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >
        <Layers size={14} color="#38bdf8" />
        <span>{isOpen ? 'Click folder to pack metrics back into the vault • Hover cards for magnetic effect' : 'Click folder to pop out platform metrics vault'}</span>
      </div>
    </section>
  );
};

export default FolderStats;
