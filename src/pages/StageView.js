import { Store } from '../store.js';
import { stages } from '../data/stages.js';
import { renderNavbar } from '../main.js';

export const StageView = ({ id }) => {
  const container = document.createElement('div');
  container.className = 'container main-content animate-fade-in';
  
  const stage = stages.find(s => s.id === id);
  
  if (!stage) {
    container.innerHTML = `<h2>Stage not found</h2><a href="#/" class="btn btn-primary">Go Back</a>`;
    return container;
  }

  // Calculate completeness
  let totalCommands = 0;
  let completedCount = 0;
  
  stage.categories.forEach(cat => {
    cat.commands.forEach(cmd => {
      totalCommands++;
      if (Store.isCommandComplete(stage.id, cmd.cmd)) completedCount++;
    });
  });
  
  const progressPercent = totalCommands > 0 ? Math.round((completedCount / totalCommands) * 100) : 0;

  let html = `
    ${renderNavbar()}
    <div class="stage-header">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
         <div style="display: flex; align-items: center; gap: 1rem;">
           <span style="font-size: 3rem">${stage.icon}</span>
           <div>
             <h1 style="margin: 0">${stage.title}</h1>
             <div class="badge badge-info mt-2">${stage.duration}</div>
           </div>
         </div>
         <div style="text-align: right">
            <a href="#/stage/${id}/terminal" class="btn btn-primary" style="margin-bottom: 0.5rem">Launch Terminal >_</a>
         </div>
      </div>
      <p class="text-secondary" style="font-size: 1.1rem; margin-bottom: 2rem;">${stage.description}</p>
      
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
        <span>Stage Progress</span>
        <span>${progressPercent}% (${completedCount}/${totalCommands})</span>
      </div>
      <div class="progress-container" style="height: 10px;">
        <div class="progress-bar" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  `;

  // Render categories and commands
  stage.categories.forEach((cat, catIndex) => {
    html += `
      <div class="category-section animate-slide-up" style="animation-delay: ${0.1 * (catIndex + 1)}s">
        <h2 style="color: var(--accent-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">${cat.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${cat.description}</p>
        
        <div class="command-grid">
    `;

    cat.commands.forEach(cmd => {
      const isComplete = Store.isCommandComplete(stage.id, cmd.cmd);
      
      html += `
        <div class="card ${isComplete ? 'completed-card' : ''}" style="${isComplete ? 'border-color: var(--success); opacity: 0.8;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items:flex-start; margin-bottom: 1rem">
            <code style="font-size: 1.2rem; background: ${isComplete ? 'rgba(80, 250, 123, 0.1)' : 'var(--bg-secondary)'}; color: ${isComplete ? 'var(--success)' : 'var(--accent-primary)'}; padding: 0.2rem 0.5rem; border-radius: 4px;">${cmd.cmd}</code>
            <label class="toggle-learned" style="cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary)">
              <input type="checkbox" ${isComplete ? 'checked' : ''} disabled style="accent-color: var(--success)">
              Learned
            </label>
          </div>
          
          <h4 style="margin-bottom: 0.5rem">${cmd.action || cmd.desc || ''}</h4>
          
          <div style="background: var(--bg-secondary); padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); margin-top: 1rem;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.2rem; text-transform: uppercase;">Syntax</div>
            <code>${cmd.syntax || cmd.cmd}</code>
          </div>
          
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center">
            <button class="btn btn-secondary btn-sm bg-tertiary toggle-details-btn" data-cmd="${cmd.cmd}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">View Examples</button>
            <button class="btn btn-primary btn-sm mark-learned-btn" data-cmd="${cmd.cmd}" ${isComplete ? 'disabled style="opacity:0.5"' : ''} style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
              ${isComplete ? '✓ Learned' : 'Mark Learned'}
            </button>
          </div>

          <div class="examples-panel" id="examples-${cmd.cmd.replace(/\W/g, '')}" style="display: none; margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 4px;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Examples:</div>
            ${(cmd.examples || []).map(ex => `<div style="font-family: var(--font-mono); color: var(--accent-secondary); font-size: 0.9rem; margin-bottom: 0.3rem;">$ ${ex}</div>`).join('') || '<div style="color: var(--text-muted); font-size: 0.9rem">No examples provided.</div>'}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Add interactions
  container.querySelectorAll('.toggle-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.target.getAttribute('data-cmd');
      const panelId = `examples-${cmd.replace(/\W/g, '')}`;
      const panel = container.querySelector(`#${panelId}`);
      if (panel) {
        if (panel.style.display === 'none') {
          panel.style.display = 'block';
          panel.classList.add('animate-fade-in');
          e.target.textContent = 'Hide Examples';
        } else {
          panel.style.display = 'none';
          e.target.textContent = 'View Examples';
        }
      }
    });
  });

  container.querySelectorAll('.mark-learned-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.target.getAttribute('data-cmd');
      const learned = Store.markCommandComplete(stage.id, cmd);
      if (learned) {
        // Re-render essentially by updating hash
        const currentHash = window.location.hash;
        window.location.hash = '';
        setTimeout(() => window.location.hash = currentHash, 10);
      }
    });
  });

  return container;
};
