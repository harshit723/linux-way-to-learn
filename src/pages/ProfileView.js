import { Store } from '../store.js';
import { achievements } from '../data/achievements.js';
import { stages } from '../data/stages.js';
import { renderNavbar } from '../main.js';

export const ProfileView = () => {
  const container = document.createElement('div');
  container.className = 'container main-content animate-fade-in';
  
  const state = Store.state;
  
  // Calculate total progress
  let totalCommands = 0;
  let completedCount = 0;
  
  stages.forEach(stage => {
    stage.categories.forEach(cat => {
      cat.commands.forEach(cmd => {
        totalCommands++;
        if (Store.isCommandComplete(stage.id, cmd.cmd)) completedCount++;
      });
    });
  });
  
  const progressPercent = totalCommands > 0 ? Math.round((completedCount / totalCommands) * 100) : 0;
  const nextLvlXp = state.level * 1000;
  const currentLvlXp = state.xp % 1000;
  const xpPercent = Math.round((currentLvlXp / 1000) * 100);

  // Check new achievements
  achievements.forEach(ach => {
      if (!state.badges.includes(ach.id) && ach.condition(state)) {
          state.badges.push(ach.id);
          Store.save();
          window.Toast?.show(`🏆 Achievement Unlocked: ${ach.title}`, 'success', 5000);
      }
  });

  const html = `
    ${renderNavbar()}
    <div style="margin-bottom: 2rem; display: flex; align-items: flex-end; gap: 2rem;">
      <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--bg-card); display: flex; justify-content: center; align-items: center; font-size: 4rem; border: 2px solid var(--accent-primary); box-shadow: var(--shadow-glow);">
        🐧
      </div>
      <div style="flex: 1">
        <h1 style="margin: 0">SysAdmin Learner</h1>
        <p class="text-secondary" style="font-size: 1.2rem">Level ${state.level}</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.9rem">
           <span>Total XP: ${state.xp}</span>
           <span>Next Level: ${nextLvlXp} XP</span>
        </div>
        <div class="progress-container">
           <div class="progress-bar" style="width: ${xpPercent}%"></div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <div class="card animate-slide-up stagger-1">
        <h3 style="color: var(--accent-secondary); margin-bottom: 1rem;">Stats</h3>
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)">
          <span class="text-secondary">Commands Learned</span>
          <span style="font-weight: bold; color: var(--success)">${completedCount} / ${totalCommands}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)">
          <span class="text-secondary">Overall Mastery</span>
          <span style="font-weight: bold; color: var(--accent-primary)">${progressPercent}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
          <span class="text-secondary">Current Streak</span>
          <span style="font-weight: bold; color: var(--warning)">🔥 ${state.streakDays} Days</span>
        </div>
      </div>
      
      <div class="card animate-slide-up stagger-2">
        <h3 style="color: var(--warning); margin-bottom: 1rem;">Badges</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
          ${achievements.map(ach => {
            const hasBadge = state.badges.includes(ach.id);
            return `
              <div style="text-align: center; opacity: ${hasBadge ? '1' : '0.3'}; filter: ${hasBadge ? 'none' : 'grayscale(1)'}; transition: all 0.3s; padding: 0.5rem; border-radius: 8px; background: var(--bg-secondary); width: 80px;" title="${ach.description}">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${ach.icon}</div>
                <div style="font-size: 0.7rem; line-height: 1.1;">${ach.title}</div>
              </div>
            `;
          }).join('')}
        </div>
        ${state.badges.length === 0 ? '<p class="text-secondary" style="font-size: 0.9rem; margin-top: 1rem;">Complete challenges and learn commands to earn badges.</p>' : ''}
      </div>
    </div>
    
    <div class="card animate-slide-up stagger-3" style="margin-top: 2rem;">
      <h3 style="margin-bottom: 1rem;">Stage Challenges</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left; border-bottom: 1px solid var(--border-color); color: var(--text-secondary)">
            <th style="padding: 0.5rem;">Stage</th>
            <th style="padding: 0.5rem;">High Score</th>
          </tr>
        </thead>
        <tbody>
          ${stages.map((stage) => {
             const score = state.challengeScores[stage.id];
             return `
               <tr style="border-bottom: 1px solid rgba(255,255,255,0.05)">
                 <td style="padding: 1rem 0.5rem; display:flex; align-items:center; gap: 0.5rem;">
                   <span style="font-size: 1.5rem">${stage.icon}</span> ${stage.title}
                 </td>
                 <td style="padding: 1rem 0.5rem;">
                   ${score !== undefined 
                     ? `<span style="color: var(--success); font-weight: bold; font-family: var(--font-mono)">${score} XP</span>` 
                     : `<span style="color: var(--text-muted)">Not attempted</span>`}
                 </td>
               </tr>
             `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  return container;
};
