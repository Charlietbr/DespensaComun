import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import './ThemeToggleButton.css';

const ThemeToggleButton = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn theme-toggle-btn ${mode}`}
    >
      {mode === 'light' ? '🌞' : '🌙'}
    </button>
  );
};

export default ThemeToggleButton;