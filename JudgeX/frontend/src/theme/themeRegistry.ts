export type ThemeId = 
  | 'judgex-blue' 
  | 'dark' 
  | 'light' 
  | 'midnight' 
  | 'aurora' 
  | 'ocean' 
  | 'forest' 
  | 'cyberpunk';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  badge?: string;
  description: string;
  isLight?: boolean;
  cssVars: Record<string, string>;
  monacoThemeId: string;
  monacoData: {
    base: 'vs-dark' | 'vs';
    inherit: boolean;
    rules: Array<{ token: string; foreground?: string; background?: string; fontStyle?: string }>;
    colors: Record<string, string>;
  };
  previewColors: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
  };
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'judgex-blue': {
    id: 'judgex-blue',
    name: 'JudgeX Blue',
    badge: '★ Signature / Default',
    description: 'Signature electric blue & deep navy with glassmorphism and subtle cyan glow.',
    isLight: false,
    previewColors: {
      bg: '#090d16',
      surface: '#0f172a',
      primary: '#3b82f6',
      accent: '#06b6d4',
      text: '#f8fafc',
    },
    cssVars: {
      '--jx-background': '#090d16',
      '--jx-surface': '#0f172a',
      '--jx-surface-card': 'rgba(15, 23, 42, 0.75)',
      '--jx-text': '#f8fafc',
      '--jx-text-secondary': '#94a3b8',
      '--jx-text-tertiary': '#64748b',
      '--jx-border': 'rgba(255, 255, 255, 0.08)',
      '--jx-border-hover': 'rgba(59, 130, 246, 0.4)',
      '--jx-primary': '#3b82f6',
      '--jx-primary-hover': '#2563eb',
      '--jx-accent': '#06b6d4',
      '--jx-success': '#10b981',
      '--jx-warning': '#f59e0b',
      '--jx-error': '#ef4444',
      '--jx-glass-bg': 'rgba(15, 23, 42, 0.6)',
      '--jx-glass-border': 'rgba(255, 255, 255, 0.1)',
      '--jx-shadow-glow': '0 0 25px rgba(59, 130, 246, 0.25)',
      
      // Backward compatibility bindings
      '--bg-primary': '#090d16',
      '--bg-secondary': '#0f172a',
      '--bg-tertiary': '#1e293b',
      '--bg-card': 'rgba(15, 23, 42, 0.75)',
      '--bg-card-hover': 'rgba(30, 41, 59, 0.85)',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#94a3b8',
      '--text-tertiary': '#64748b',
      '--accent-primary': '#3b82f6',
      '--accent-primary-hover': '#2563eb',
      '--border-color': 'rgba(255, 255, 255, 0.08)',
      '--glass-bg': 'rgba(15, 23, 42, 0.6)',
      '--glass-border': 'rgba(255, 255, 255, 0.1)',
    },
    monacoThemeId: 'jx-theme-judgex-blue',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'type', foreground: 'a855f7' },
        { token: 'variable', foreground: 'f8fafc' },
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#0f172a80',
        'editorCursor.foreground': '#38bdf8',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editor.selectionBackground': '#1e40af60',
        'editor.inactiveSelectionBackground': '#1e40af30',
        'editorMinimap.background': '#090d16',
        'scrollbarSlider.background': '#ffffff15',
        'scrollbarSlider.hoverBackground': '#3b82f650',
      }
    }
  },

  'dark': {
    id: 'dark',
    name: 'Dark Slate',
    description: 'Sleek carbon black and neutral dark slate with indigo highlights.',
    isLight: false,
    previewColors: {
      bg: '#0f0f13',
      surface: '#18181f',
      primary: '#6366f1',
      accent: '#818cf8',
      text: '#f3f4f6',
    },
    cssVars: {
      '--jx-background': '#0f0f13',
      '--jx-surface': '#18181f',
      '--jx-surface-card': 'rgba(24, 24, 31, 0.8)',
      '--jx-text': '#f3f4f6',
      '--jx-text-secondary': '#9ca3af',
      '--jx-text-tertiary': '#6b7280',
      '--jx-border': 'rgba(255, 255, 255, 0.07)',
      '--jx-border-hover': 'rgba(99, 102, 241, 0.4)',
      '--jx-primary': '#6366f1',
      '--jx-primary-hover': '#4f46e5',
      '--jx-accent': '#818cf8',
      '--jx-success': '#10b981',
      '--jx-warning': '#f59e0b',
      '--jx-error': '#f43f5e',
      '--jx-glass-bg': 'rgba(24, 24, 31, 0.65)',
      '--jx-glass-border': 'rgba(255, 255, 255, 0.08)',
      '--jx-shadow-glow': '0 0 25px rgba(99, 102, 241, 0.25)',

      '--bg-primary': '#0f0f13',
      '--bg-secondary': '#18181f',
      '--bg-tertiary': '#262631',
      '--bg-card': 'rgba(24, 24, 31, 0.8)',
      '--bg-card-hover': 'rgba(38, 38, 49, 0.9)',
      '--text-primary': '#f3f4f6',
      '--text-secondary': '#9ca3af',
      '--text-tertiary': '#6b7280',
      '--accent-primary': '#6366f1',
      '--accent-primary-hover': '#4f46e5',
      '--border-color': 'rgba(255, 255, 255, 0.07)',
      '--glass-bg': 'rgba(24, 24, 31, 0.65)',
      '--glass-border': 'rgba(255, 255, 255, 0.08)',
    },
    monacoThemeId: 'jx-theme-dark',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'function', foreground: 'a5b4fc' },
        { token: 'type', foreground: 'c084fc' },
        { token: 'variable', foreground: 'f3f4f6' },
      ],
      colors: {
        'editor.background': '#0f0f13',
        'editor.foreground': '#f3f4f6',
        'editor.lineHighlightBackground': '#18181f90',
        'editorCursor.foreground': '#818cf8',
        'editorLineNumber.foreground': '#374151',
        'editorLineNumber.activeForeground': '#818cf8',
        'editor.selectionBackground': '#4338ca60',
        'editorMinimap.background': '#0f0f13',
      }
    }
  },

  'light': {
    id: 'light',
    name: 'Light Developer',
    description: 'Clean, high-contrast light environment with ocean blue accents.',
    isLight: true,
    previewColors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      primary: '#0284c7',
      accent: '#0369a1',
      text: '#0f172a',
    },
    cssVars: {
      '--jx-background': '#f8fafc',
      '--jx-surface': '#ffffff',
      '--jx-surface-card': 'rgba(255, 255, 255, 0.9)',
      '--jx-text': '#0f172a',
      '--jx-text-secondary': '#475569',
      '--jx-text-tertiary': '#94a3b8',
      '--jx-border': 'rgba(15, 23, 42, 0.12)',
      '--jx-border-hover': 'rgba(2, 132, 199, 0.4)',
      '--jx-primary': '#0284c7',
      '--jx-primary-hover': '#0369a1',
      '--jx-accent': '#0284c7',
      '--jx-success': '#16a34a',
      '--jx-warning': '#d97706',
      '--jx-error': '#dc2626',
      '--jx-glass-bg': 'rgba(255, 255, 255, 0.85)',
      '--jx-glass-border': 'rgba(15, 23, 42, 0.12)',
      '--jx-shadow-glow': '0 0 25px rgba(2, 132, 199, 0.15)',

      '--bg-primary': '#f8fafc',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e2e8f0',
      '--bg-card': 'rgba(255, 255, 255, 0.9)',
      '--bg-card-hover': '#f1f5f9',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-tertiary': '#94a3b8',
      '--accent-primary': '#0284c7',
      '--accent-primary-hover': '#0369a1',
      '--border-color': 'rgba(15, 23, 42, 0.12)',
      '--glass-bg': 'rgba(255, 255, 255, 0.85)',
      '--glass-border': 'rgba(15, 23, 42, 0.12)',
    },
    monacoThemeId: 'jx-theme-light',
    monacoData: {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: 'd97706' },
        { token: 'function', foreground: '2563eb' },
        { token: 'type', foreground: '7c3aed' },
        { token: 'variable', foreground: '#0f172a' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorCursor.foreground': '#0284c7',
        'editorLineNumber.foreground': '#cbd5e1',
        'editorLineNumber.activeForeground': '#0284c7',
        'editor.selectionBackground': '#bae6fd60',
        'editorMinimap.background': '#ffffff',
      }
    }
  },

  'midnight': {
    id: 'midnight',
    name: 'Midnight Obsidian',
    description: 'Ultra-dark deep black with glowing violet and amethyst accents.',
    isLight: false,
    previewColors: {
      bg: '#030712',
      surface: '#111827',
      primary: '#8b5cf6',
      accent: '#c084fc',
      text: '#f9fafb',
    },
    cssVars: {
      '--jx-background': '#030712',
      '--jx-surface': '#111827',
      '--jx-surface-card': 'rgba(17, 24, 39, 0.8)',
      '--jx-text': '#f9fafb',
      '--jx-text-secondary': '#9ca3af',
      '--jx-text-tertiary': '#4b5563',
      '--jx-border': 'rgba(255, 255, 255, 0.08)',
      '--jx-border-hover': 'rgba(139, 92, 246, 0.4)',
      '--jx-primary': '#8b5cf6',
      '--jx-primary-hover': '#7c3aed',
      '--jx-accent': '#c084fc',
      '--jx-success': '#10b981',
      '--jx-warning': '#f59e0b',
      '--jx-error': '#ef4444',
      '--jx-glass-bg': 'rgba(17, 24, 39, 0.7)',
      '--jx-glass-border': 'rgba(255, 255, 255, 0.1)',
      '--jx-shadow-glow': '0 0 25px rgba(139, 92, 246, 0.25)',

      '--bg-primary': '#030712',
      '--bg-secondary': '#111827',
      '--bg-tertiary': '#1f2937',
      '--bg-card': 'rgba(17, 24, 39, 0.8)',
      '--bg-card-hover': 'rgba(31, 41, 55, 0.9)',
      '--text-primary': '#f9fafb',
      '--text-secondary': '#9ca3af',
      '--text-tertiary': '#4b5563',
      '--accent-primary': '#8b5cf6',
      '--accent-primary-hover': '#7c3aed',
      '--border-color': 'rgba(255, 255, 255, 0.08)',
      '--glass-bg': 'rgba(17, 24, 39, 0.7)',
      '--glass-border': 'rgba(255, 255, 255, 0.1)',
    },
    monacoThemeId: 'jx-theme-midnight',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '4b5563', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'function', foreground: 'a78bfa' },
        { token: 'type', foreground: 'f472b6' },
        { token: 'variable', foreground: '#f9fafb' },
      ],
      colors: {
        'editor.background': '#030712',
        'editor.foreground': '#f9fafb',
        'editor.lineHighlightBackground': '#111827',
        'editorCursor.foreground': '#c084fc',
        'editorLineNumber.foreground': '#374151',
        'editorLineNumber.activeForeground': '#c084fc',
        'editor.selectionBackground': '#6b21a860',
        'editorMinimap.background': '#030712',
      }
    }
  },

  'aurora': {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights aesthetics featuring teal, cyan, and vibrant violet.',
    isLight: false,
    previewColors: {
      bg: '#0b1329',
      surface: '#111c38',
      primary: '#14b8a6',
      accent: '#a855f7',
      text: '#f0fdf4',
    },
    cssVars: {
      '--jx-background': '#0b1329',
      '--jx-surface': '#111c38',
      '--jx-surface-card': 'rgba(17, 28, 56, 0.8)',
      '--jx-text': '#f0fdf4',
      '--jx-text-secondary': '#94a3b8',
      '--jx-text-tertiary': '#64748b',
      '--jx-border': 'rgba(255, 255, 255, 0.09)',
      '--jx-border-hover': 'rgba(20, 184, 166, 0.4)',
      '--jx-primary': '#14b8a6',
      '--jx-primary-hover': '#0d9488',
      '--jx-accent': '#a855f7',
      '--jx-success': '#22c55e',
      '--jx-warning': '#f59e0b',
      '--jx-error': '#f43f5e',
      '--jx-glass-bg': 'rgba(17, 28, 56, 0.65)',
      '--jx-glass-border': 'rgba(255, 255, 255, 0.1)',
      '--jx-shadow-glow': '0 0 25px rgba(20, 184, 166, 0.25)',

      '--bg-primary': '#0b1329',
      '--bg-secondary': '#111c38',
      '--bg-tertiary': '#1e294b',
      '--bg-card': 'rgba(17, 28, 56, 0.8)',
      '--bg-card-hover': 'rgba(30, 41, 75, 0.9)',
      '--text-primary': '#f0fdf4',
      '--text-secondary': '#94a3b8',
      '--text-tertiary': '#64748b',
      '--accent-primary': '#14b8a6',
      '--accent-primary-hover': '#0d9488',
      '--border-color': 'rgba(255, 255, 255, 0.09)',
      '--glass-bg': 'rgba(17, 28, 56, 0.65)',
      '--glass-border': 'rgba(255, 255, 255, 0.1)',
    },
    monacoThemeId: 'jx-theme-aurora',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '2dd4bf', fontStyle: 'bold' },
        { token: 'string', foreground: 'a855f7' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'function', foreground: '38bdf8' },
        { token: 'type', foreground: 'c084fc' },
        { token: 'variable', foreground: '#f0fdf4' },
      ],
      colors: {
        'editor.background': '#0b1329',
        'editor.foreground': '#f0fdf4',
        'editor.lineHighlightBackground': '#111c38',
        'editorCursor.foreground': '#2dd4bf',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#2dd4bf',
        'editor.selectionBackground': '#0f766e60',
        'editorMinimap.background': '#0b1329',
      }
    }
  },

  'ocean': {
    id: 'ocean',
    name: 'Abyssal Ocean',
    description: 'Deep maritime navy with bioluminescent seafoam green glow.',
    isLight: false,
    previewColors: {
      bg: '#0a192f',
      surface: '#112240',
      primary: '#64ffda',
      accent: '#00b4d8',
      text: '#e6f1ff',
    },
    cssVars: {
      '--jx-background': '#0a192f',
      '--jx-surface': '#112240',
      '--jx-surface-card': 'rgba(17, 34, 64, 0.8)',
      '--jx-text': '#e6f1ff',
      '--jx-text-secondary': '#8892b0',
      '--jx-text-tertiary': '#495670',
      '--jx-border': 'rgba(100, 255, 218, 0.12)',
      '--jx-border-hover': 'rgba(100, 255, 218, 0.4)',
      '--jx-primary': '#64ffda',
      '--jx-primary-hover': '#45e6c0',
      '--jx-accent': '#00b4d8',
      '--jx-success': '#64ffda',
      '--jx-warning': '#ffd166',
      '--jx-error': '#ff5a5f',
      '--jx-glass-bg': 'rgba(17, 34, 64, 0.7)',
      '--jx-glass-border': 'rgba(100, 255, 218, 0.15)',
      '--jx-shadow-glow': '0 0 25px rgba(100, 255, 218, 0.25)',

      '--bg-primary': '#0a192f',
      '--bg-secondary': '#112240',
      '--bg-tertiary': '#233554',
      '--bg-card': 'rgba(17, 34, 64, 0.8)',
      '--bg-card-hover': 'rgba(35, 53, 84, 0.9)',
      '--text-primary': '#e6f1ff',
      '--text-secondary': '#8892b0',
      '--text-tertiary': '#495670',
      '--accent-primary': '#64ffda',
      '--accent-primary-hover': '#45e6c0',
      '--border-color': 'rgba(100, 255, 218, 0.12)',
      '--glass-bg': 'rgba(17, 34, 64, 0.7)',
      '--glass-border': 'rgba(100, 255, 218, 0.15)',
    },
    monacoThemeId: 'jx-theme-ocean',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '495670', fontStyle: 'italic' },
        { token: 'keyword', foreground: '64ffda', fontStyle: 'bold' },
        { token: 'string', foreground: 'ffd166' },
        { token: 'number', foreground: 'ff5a5f' },
        { token: 'function', foreground: '00b4d8' },
        { token: 'type', foreground: '90e0ef' },
        { token: 'variable', foreground: '#e6f1ff' },
      ],
      colors: {
        'editor.background': '#0a192f',
        'editor.foreground': '#e6f1ff',
        'editor.lineHighlightBackground': '#112240',
        'editorCursor.foreground': '#64ffda',
        'editorLineNumber.foreground': '#233554',
        'editorLineNumber.activeForeground': '#64ffda',
        'editor.selectionBackground': '#112240aa',
        'editorMinimap.background': '#0a192f',
      }
    }
  },

  'forest': {
    id: 'forest',
    name: 'Pine Forest',
    description: 'Deep evergreen pine dark theme with emerald & gold accents.',
    isLight: false,
    previewColors: {
      bg: '#0c1a14',
      surface: '#142820',
      primary: '#10b981',
      accent: '#eab308',
      text: '#ecfdf5',
    },
    cssVars: {
      '--jx-background': '#0c1a14',
      '--jx-surface': '#142820',
      '--jx-surface-card': 'rgba(20, 40, 32, 0.8)',
      '--jx-text': '#ecfdf5',
      '--jx-text-secondary': '#6ee7b7',
      '--jx-text-tertiary': '#34d399',
      '--jx-border': 'rgba(16, 185, 129, 0.12)',
      '--jx-border-hover': 'rgba(16, 185, 129, 0.4)',
      '--jx-primary': '#10b981',
      '--jx-primary-hover': '#059669',
      '--jx-accent': '#eab308',
      '--jx-success': '#10b981',
      '--jx-warning': '#eab308',
      '--jx-error': '#f43f5e',
      '--jx-glass-bg': 'rgba(20, 40, 32, 0.7)',
      '--jx-glass-border': 'rgba(16, 185, 129, 0.15)',
      '--jx-shadow-glow': '0 0 25px rgba(16, 185, 129, 0.25)',

      '--bg-primary': '#0c1a14',
      '--bg-secondary': '#142820',
      '--bg-tertiary': '#1c382c',
      '--bg-card': 'rgba(20, 40, 32, 0.8)',
      '--bg-card-hover': 'rgba(28, 56, 44, 0.9)',
      '--text-primary': '#ecfdf5',
      '--text-secondary': '#90e0ef',
      '--text-tertiary': '#047857',
      '--accent-primary': '#10b981',
      '--accent-primary-hover': '#059669',
      '--border-color': 'rgba(16, 185, 129, 0.12)',
      '--glass-bg': 'rgba(20, 40, 32, 0.7)',
      '--glass-border': 'rgba(16, 185, 129, 0.15)',
    },
    monacoThemeId: 'jx-theme-forest',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '047857', fontStyle: 'italic' },
        { token: 'keyword', foreground: '34d399', fontStyle: 'bold' },
        { token: 'string', foreground: 'eab308' },
        { token: 'number', foreground: 'f97316' },
        { token: 'function', foreground: '6ee7b7' },
        { token: 'type', foreground: 'a7f3d0' },
        { token: 'variable', foreground: '#ecfdf5' },
      ],
      colors: {
        'editor.background': '#0c1a14',
        'editor.foreground': '#ecfdf5',
        'editor.lineHighlightBackground': '#142820',
        'editorCursor.foreground': '#34d399',
        'editorLineNumber.foreground': '#164e63',
        'editorLineNumber.activeForeground': '#34d399',
        'editor.selectionBackground': '#064e3b70',
        'editorMinimap.background': '#0c1a14',
      }
    }
  },

  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-contrast neon magenta, electric cyan, and laser yellow on dark violet.',
    isLight: false,
    previewColors: {
      bg: '#0d021a',
      surface: '#1a0533',
      primary: '#ff007f',
      accent: '#00f0ff',
      text: '#ffffff',
    },
    cssVars: {
      '--jx-background': '#0d021a',
      '--jx-surface': '#1a0533',
      '--jx-surface-card': 'rgba(26, 5, 51, 0.85)',
      '--jx-text': '#ffffff',
      '--jx-text-secondary': '#00f0ff',
      '--jx-text-tertiary': '#b57edc',
      '--jx-border': 'rgba(255, 0, 127, 0.25)',
      '--jx-border-hover': 'rgba(0, 240, 255, 0.5)',
      '--jx-primary': '#ff007f',
      '--jx-primary-hover': '#e0006f',
      '--jx-accent': '#00f0ff',
      '--jx-success': '#00ff66',
      '--jx-warning': '#ffe600',
      '--jx-error': '#ff0055',
      '--jx-glass-bg': 'rgba(26, 5, 51, 0.75)',
      '--jx-glass-border': 'rgba(255, 0, 127, 0.3)',
      '--jx-shadow-glow': '0 0 25px rgba(255, 0, 127, 0.35)',

      '--bg-primary': '#0d021a',
      '--bg-secondary': '#1a0533',
      '--bg-tertiary': '#2d0854',
      '--bg-card': 'rgba(26, 5, 51, 0.85)',
      '--bg-card-hover': 'rgba(45, 8, 84, 0.95)',
      '--text-primary': '#ffffff',
      '--text-secondary': '#00f0ff',
      '--text-tertiary': '#b57edc',
      '--accent-primary': '#ff007f',
      '--accent-primary-hover': '#e0006f',
      '--border-color': 'rgba(255, 0, 127, 0.25)',
      '--glass-bg': 'rgba(26, 5, 51, 0.75)',
      '--glass-border': 'rgba(255, 0, 127, 0.3)',
    },
    monacoThemeId: 'jx-theme-cyberpunk',
    monacoData: {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'b57edc', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff007f', fontStyle: 'bold' },
        { token: 'string', foreground: 'ffe600' },
        { token: 'number', foreground: '00ff66' },
        { token: 'function', foreground: '00f0ff' },
        { token: 'type', foreground: 'ff7700' },
        { token: 'variable', foreground: '#ffffff' },
      ],
      colors: {
        'editor.background': '#0d021a',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#1a0533',
        'editorCursor.foreground': '#ff007f',
        'editorLineNumber.foreground': '#521482',
        'editorLineNumber.activeForeground': '#00f0ff',
        'editor.selectionBackground': '#ff007f50',
        'editorMinimap.background': '#0d021a',
      }
    }
  }
};

/**
 * Registers all 8 JudgeX custom themes into Monaco Editor instance safely
 */
export function registerMonacoThemes(monaco: any) {
  if (!monaco || !monaco.editor) return;

  Object.values(THEMES).forEach((theme) => {
    try {
      monaco.editor.defineTheme(theme.monacoThemeId, theme.monacoData);
    } catch (e) {
      console.warn(`Failed to define Monaco theme ${theme.monacoThemeId}`, e);
    }
  });
}
