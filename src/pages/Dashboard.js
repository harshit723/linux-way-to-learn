import { Store } from '../store.js';
import { stages } from '../data/stages.js';
import { renderNavbar } from '../main.js';

export const Dashboard = () => {
  const container = document.createElement('div');
  container.className = 'container main-content animate-fade-in';
  
  // Calculate total progress
  let totalCommands = 0;
  let completedCount = 0;
  
  stages.forEach(stage => {
    stage.categories.forEach(cat => {
      cat.commands.forEach(cmd => {
        totalCommands++;
        if (Store.isCommandComplete(stage.id, cmd.cmd)) {
          completedCount++;
        }
      });
    });
  });
  
  const progressPercent = totalCommands > 0 ? Math.round((completedCount / totalCommands) * 100) : 0;

  const html = `
    ${renderNavbar()}
    <div class="hero-section">
      <h1 class="hero-title animate-slide-up">Master the Linux Terminal</h1>
      <p class="hero-subtitle animate-slide-up stagger-1">Learn, practice, and conquer Linux through interactive challenges and a simulated virtual machine — right in your browser.</p>
      
      <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;" class="animate-slide-up stagger-2">
          <div class="card" style="min-width: 200px; padding: 1rem;">
            <div style="font-size: 0.9rem; color: var(--text-secondary)">Overall Progress</div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--accent-primary)">${progressPercent}%</div>
            <div class="progress-container" style="margin-top: 0.5rem">
              <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div style="font-size: 0.8rem; margin-top: 0.5rem">${completedCount} / ${totalCommands} Commands</div>
          </div>
          <div class="card" style="min-width: 200px; padding: 1rem;">
             <div style="font-size: 0.9rem; color: var(--text-secondary)">Current Streak</div>
             <div style="font-size: 2rem; font-weight: bold; color: var(--warning)">🔥 ${Store.state.streakDays}</div>
             <div style="font-size: 0.8rem; margin-top: 0.5rem">Days Active</div>
          </div>
      </div>
    </div>
    
    <h2 style="margin-bottom: var(--spacing-lg)">Learning Roadmap</h2>
    <div class="dashboard-grid">
      ${stages.map((stage, i) => {
        // Calculate stage specific progress
        let stageTotal = 0;
        let stageCompleted = 0;
        stage.categories.forEach(c => {
          c.commands.forEach(cmd => {
            stageTotal++;
            if (Store.isCommandComplete(stage.id, cmd.cmd)) stageCompleted++;
          });
        });
        const stageProgress = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;
        
        return `
          <a href="#/stage/${stage.id}" class="card animate-slide-up" style="animation-delay: ${0.1 * (i+1)}s; text-decoration: none; color: inherit; display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div style="font-size: 2.5rem">${stage.icon}</div>
              <div class="badge badge-info">${stage.duration}</div>
            </div>
            <h3>${stage.title}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">${stage.description}</p>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem">
              <span>Progress</span>
              <span>${stageProgress}%</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${stageProgress}%"></div>
            </div>
          </a>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
  return container;
};
