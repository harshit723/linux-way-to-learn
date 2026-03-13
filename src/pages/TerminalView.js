import { Terminal } from '../terminal/Terminal.js';
import { renderNavbar } from '../main.js';

export const TerminalView = ({ id }) => {
  const container = document.createElement('div');
  container.className = 'container main-content animate-fade-in';
  container.style.paddingTop = '1rem';
  
  container.innerHTML = `
    ${renderNavbar()}
    <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
      <a href="#/stage/${id}" class="text-secondary">← Back to Stage</a>
      <h3 style="margin:0; text-shadow: 0 0 10px var(--accent-primary-glow)">Virtual Terminal Machine</h3>
    </div>
    <div class="terminal-layout" style="height: calc(100vh - 180px);">
      <div class="terminal-header">
        <div class="terminal-controls">
          <button class="terminal-btn btn-close" onclick="window.location.hash='#/stage/${id}'" title="Terminate VM"></button>
          <button class="terminal-btn btn-min"></button>
          <button class="terminal-btn btn-max"></button>
        </div>
        <div class="text-secondary" style="font-size: 0.8rem">user@linuxlab:~</div>
      </div>
      <div class="terminal-body" id="virtual-terminal">
      </div>
    </div>
  `;

  // Initialize Terminal component after DOM mount
  setTimeout(() => {
    const termContainer = container.querySelector('#virtual-terminal');
    const terminal = new Terminal(termContainer);
    terminal.print('Linux 5.15.0-generic x86_64');
    terminal.print('Welcome to the simulated interactive shell.');
    terminal.print('Type "help" to see available commands or just start exploring.\n');
  }, 100);

  return container;
};
