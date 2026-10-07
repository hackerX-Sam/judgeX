import React from 'react';
import { Sun, Moon, Grid, Sparkles } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import CardNav from './CardNav/CardNav';

export const ThemeToggle = () => {
  const { activeTheme, setThemeId } = useTheme();

  return (
    <button 
      onClick={() => setThemeId(activeTheme.isLight ? 'judgex-blue' : 'light')} 
      className="theme-toggle-btn" 
      aria-label="Toggle theme"
      title={activeTheme.isLight ? "Switch to JudgeX Dark Mode" : "Switch to Light Mode"}
    >
      {activeTheme.isLight ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
};

export const BackgroundToggle = () => {
  const { bgMode, setBgMode } = useTheme();
  const isGridScan = bgMode === 'gridscan';

  return (
    <button
      onClick={() => setBgMode(isGridScan ? 'classic' : 'gridscan')}
      className="bg-toggle-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.35rem 0.65rem',
        borderRadius: '8px',
        background: isGridScan ? 'rgba(56, 189, 248, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        border: isGridScan ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
        color: isGridScan ? '#38bdf8' : '#60a5fa',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title={isGridScan ? "Current: GridScan (React Bits). Click to revert to Classic Canvas." : "Current: Classic Canvas. Click to enable GridScan."}
    >
      {isGridScan ? (
        <>
          <Grid size={14} />
          <span>GridScan</span>
        </>
      ) : (
        <>
          <Sparkles size={14} />
          <span>Classic</span>
        </>
      )}
    </button>
  );
};

export const Navbar = ({ active, transparent = false }: { active?: string; transparent?: boolean }) => {
  return <CardNav active={active} className={transparent ? 'transparent' : ''} />;
};

export default Navbar;
