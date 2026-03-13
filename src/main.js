import './style.css';
import { Store } from './store.js';
import { Router } from './router.js';

import { Dashboard } from './pages/Dashboard.js';
import { StageView } from './pages/StageView.js';
import { TerminalView } from './pages/TerminalView.js';
import { ChallengeView } from './pages/ChallengeView.js';
import { ProfileView } from './pages/ProfileView.js';

// Simple Toast System
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(message, type = 'info', duration = 3000) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icon = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }[type];

    toast.innerHTML = `
      <span style="font-weight: bold">${icon}</span>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Global UI Components
export function renderNavbar() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const themeIcon = currentTheme === 'light' ? '🌙' : '☀️';

  return `
    <nav class="navbar">
      <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
        <a href="#/" class="nav-brand">
          <span>>_</span> Linux Learning Path
        </a>
        <div class="nav-links" style="display: flex; align-items: center;">
          <a href="#/" class="nav-link">Roadmap</a>
          <a href="#/profile" class="nav-link">Profile</a>
          <button onclick="window.toggleTheme()" class="btn btn-secondary btn-sm" style="margin-right: 1rem; padding: 0.2rem 0.6rem; font-size: 1.2rem; background: transparent; border: 1px solid var(--border-color);" id="theme-toggle">
            ${themeIcon}
          </button>
          <div class="xp-display" id="global-xp-display">
            <span class="xp-label">LVL <span id="nav-lvl">${Store.state.level}</span></span>
            <span class="xp-value" id="nav-xp">${Store.state.xp} XP</span>
          </div>
        </div>
      </div>
    </nav>
  `;
}

// Theme handling
window.toggleTheme = () => {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const newTheme = current === 'light' ? 'dark' : 'light';
  
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
  }
};

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

// Subscribe to store to update Navbar XP
Store.subscribe((state) => {
  const lvlEl = document.getElementById('nav-lvl');
  const xpEl = document.getElementById('nav-xp');
  if (lvlEl) lvlEl.textContent = state.level;
  if (xpEl) xpEl.textContent = `${state.xp} XP`;
});

// Application Bootstrap
function initApp() {
  initTheme();
  window.Toast = new ToastManager();
  Store.init();

  // Initialize Router
  const routes = {
    '/': Dashboard,
    '/stage/:id': StageView,
    '/stage/:id/terminal': TerminalView,
    '/stage/:id/challenge': ChallengeView,
    '/profile': ProfileView
  };

  const router = new Router(routes);
  router.init();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
