import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, registerMonacoThemes } from './themeRegistry';
import type { ThemeId, ThemeDefinition } from './themeRegistry';

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  tabSize: 2 | 4;
  lineNumbers: 'on' | 'off';
  cursorStyle: 'line' | 'block' | 'underline';
}

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: "'Consolas', 'JetBrains Mono', 'Fira Code', monospace",
  wordWrap: 'on',
  minimap: false,
  tabSize: 2,
  lineNumbers: 'on',
  cursorStyle: 'line',
};

interface ThemeContextType {
  activeThemeId: ThemeId;
  activeTheme: ThemeDefinition;
  setThemeId: (id: ThemeId) => void;
  editorSettings: EditorSettings;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  registerMonaco: (monaco: any) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = 'judgex_theme';
const STORAGE_EDITOR_KEY = 'judgex_editor_settings';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId;
    return saved && THEMES[saved] ? saved : 'judgex-blue';
  });

  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EDITOR_KEY);
      return saved ? { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(saved) } : DEFAULT_EDITOR_SETTINGS;
    } catch {
      return DEFAULT_EDITOR_SETTINGS;
    }
  });

  const [monacoInstance, setMonacoInstance] = useState<any>(null);

  // Apply CSS Variables and Theme Attributes to DOM
  const applyThemeToDOM = useCallback((themeId: ThemeId) => {
    const theme = THEMES[themeId] || THEMES['judgex-blue'];
    const root = document.documentElement;

    root.setAttribute('data-jx-theme', theme.id);

    // Apply all CSS Design Tokens
    Object.entries(theme.cssVars).forEach(([varName, varVal]) => {
      root.style.setProperty(varName, varVal);
    });

    // Dark/Light class compatibility
    if (theme.isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, []);

  // Update Theme
  const setThemeId = useCallback((id: ThemeId) => {
    if (!THEMES[id]) return;
    setActiveThemeId(id);
    localStorage.setItem(STORAGE_THEME_KEY, id);
    applyThemeToDOM(id);

    // If Monaco is loaded, switch Monaco theme instantly
    if (monacoInstance && monacoInstance.editor) {
      try {
        monacoInstance.editor.setTheme(THEMES[id].monacoThemeId);
      } catch (e) {
        console.warn('Failed to switch Monaco theme dynamically', e);
      }
    }
  }, [applyThemeToDOM, monacoInstance]);

  // Update Editor Settings
  const updateEditorSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setEditorSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_EDITOR_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Register Monaco Instance
  const registerMonaco = useCallback((monaco: any) => {
    if (!monaco) return;
    setMonacoInstance(monaco);
    registerMonacoThemes(monaco);
    const theme = THEMES[activeThemeId] || THEMES['judgex-blue'];
    try {
      monaco.editor.setTheme(theme.monacoThemeId);
    } catch (e) {
      console.warn('Monaco initial theme setup exception', e);
    }
  }, [activeThemeId]);

  // Initial DOM application on mount
  useEffect(() => {
    applyThemeToDOM(activeThemeId);
  }, [activeThemeId, applyThemeToDOM]);

  const activeTheme = THEMES[activeThemeId] || THEMES['judgex-blue'];

  return (
    <ThemeContext.Provider value={{
      activeThemeId,
      activeTheme,
      setThemeId,
      editorSettings,
      updateEditorSettings,
      registerMonaco,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
