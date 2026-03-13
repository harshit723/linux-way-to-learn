import { Store } from '../store.js';
import { challenges } from '../data/challenges.js';

export const ChallengeView = ({ id }) => {
  const container = document.createElement('div');
  container.className = 'container main-content animate-fade-in';
  
  const challenge = challenges[id];
  
  if (!challenge) {
    container.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <a href="#/stage/${id}" class="text-secondary">← Back to Stage</a>
      </div>
      <h2>No Challenge Available</h2>
      <p class="text-secondary">This stage does not have a challenge yet.</p>
    `;
    return container;
  }

  // Define Layout
  container.innerHTML = `
    <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <a href="#/stage/${id}" class="text-secondary">← Back to Stage</a>
      <h3 style="margin:0; color:var(--accent-secondary)">Evaluation Mode: ${challenge.title}</h3>
    </div>
    
    <div class="challenge-layout">
      <!-- Sidebar / Objectives -->
      <div class="challenge-sidebar animate-slide-up stagger-1">
        <h4>Objectives</h4>
        <p class="text-secondary" style="font-size: 0.9rem; margin-bottom: 1rem;">${challenge.description}</p>
        
        <div class="timer" id="challenge-timer">${formatTime(challenge.timeLimit)}</div>
        
        <ul class="task-list" id="objective-list">
          ${challenge.objectives.map((obj, i) => `
            <li class="task-item" id="obj-${obj.id}">
              <span class="task-icon">▢</span>
              <span style="font-size: 0.9rem">${obj.text}</span>
            </li>
          `).join('')}
        </ul>
        
        <div id="challenge-results" style="display:none; text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color)">
            <h3 style="color: var(--success)">Challenge Complete!</h3>
            <div style="font-size: 2rem; font-weight: bold; margin: 1rem 0;" id="final-score"></div>
            <a href="#/stage/${id}" class="btn btn-primary" style="width: 100%">Return to Stage</a>
        </div>
      </div>
      
      <!-- Terminal Area -->
      <div class="terminal-container animate-slide-up stagger-2" style="position: relative;">
        <!-- The terminal will be mounted here -->
      </div>
    </div>
  `;

  // Start logic after mount
  setTimeout(() => {
    initChallengeLogic(container, id, challenge);
  }, 100);

  return container;
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function initChallengeLogic(container, stageId, challenge) {
  import('../terminal/Terminal.js').then(({ Terminal }) => {
    import('../scoring/Evaluator.js').then(({ Evaluator }) => {
       const termContainer = container.querySelector('.terminal-container');
       termContainer.innerHTML = `<div class="terminal-layout" style="height: 100%; border: 2px solid var(--accent-secondary); box-shadow: 0 0 15px rgba(0, 229, 255, 0.2)">
         <div class="terminal-header" style="background: rgba(0, 229, 255, 0.1)">
           <div class="terminal-controls">
             <div class="terminal-btn btn-close"></div>
           </div>
           <div style="font-size: 0.8rem; font-weight: bold; color: var(--accent-secondary)">EVALUATION ENVIRONMENT</div>
         </div>
         <div class="terminal-body" id="eval-term"></div>
       </div>`;
       
       const termBody = termContainer.querySelector('#eval-term');
       const terminal = new Terminal(termBody);
       const evaluator = new Evaluator(stageId, terminal.fs);
       
       let timeRemaining = challenge.timeLimit;
       let timerInterval;
       
       const timerEl = container.querySelector('#challenge-timer');
       
       // Setup evaluator callbacks
       evaluator.onObjectiveComplete = (objId) => {
         const el = container.querySelector(`#obj-${objId}`);
         if (el) {
           el.classList.add('completed');
           el.querySelector('.task-icon').textContent = '✓';
           el.querySelector('.task-icon').style.color = 'var(--success)';
         }
       };
       
       evaluator.onChallengeComplete = (score) => {
         clearInterval(timerInterval);
         timerEl.style.color = 'var(--success)';
         
         const resultsEl = container.querySelector('#challenge-results');
         const scoreEl = container.querySelector('#final-score');
         resultsEl.style.display = 'block';
         scoreEl.innerHTML = `${score} <span style="font-size: 1rem; color: var(--accent-secondary)">XP</span>`;
         
         // Disable terminal
         terminal.inputElement.disabled = true;
         terminal.print('\n[SYSTEM] Evaluation Complete. Terminating environment...', true);
       };
       
       // Bind terminal executed event
       terminal.onCommandExecuted = (ctx) => {
          evaluator.evaluate(ctx.cmd, ctx.history);
       };
       
       // Start timer
       timerInterval = setInterval(() => {
         timeRemaining--;
         timerEl.textContent = formatTime(timeRemaining);
         
         if (timeRemaining <= 10) timerEl.style.color = 'var(--danger)';
         
         if (timeRemaining <= 0) {
           clearInterval(timerInterval);
           terminal.inputElement.disabled = true;
           terminal.print('\n[SYSTEM] Time limit reached. Evaluation Failed.', true);
           timerEl.textContent = 'TIME UP';
         }
       }, 1000);
       
       terminal.print(`Starting evaluation for: ${challenge.title}\nComplete all objectives before the timer runs out.\nGood luck!\n\n`);
    });
  });
}
