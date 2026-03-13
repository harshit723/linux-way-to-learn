export const Store = {
  state: {
    // User progress
    completedCommands: [], // Array of command IDs e.g., 'stage1-ls'
    completedStages: [], // Array of stage IDs
    
    // Gamification
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    badges: [],
    
    // Challenge scores
    challengeScores: {}, // { 'stage1': 100, 'stage2': 85 }
    
    // Settings
    theme: 'dark'
  },

  listeners: [],

  init() {
    this.load();
    this.checkStreak();
  },

  load() {
    const saved = localStorage.getItem('linuxLearningState');
    if (saved) {
      try {
        this.state = { ...this.state, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to load save data', e);
      }
    }
  },

  save() {
    localStorage.setItem('linuxLearningState', JSON.stringify(this.state));
    this.notify();
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  },

  // Actions
  addXP(amount, reason = '') {
    this.state.xp += amount;
    
    // Level up logic (every 1000 XP)
    const newLevel = Math.floor(this.state.xp / 1000) + 1;
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
      window.Toast?.show(`Level Up! You are now Level ${newLevel} 🚀`, 'success');
    }
    
    if (reason && window.Toast) {
      window.Toast.show(`+${amount} XP: ${reason}`, 'info');
    }
    
    this.save();
  },

  markCommandComplete(stageId, commandId) {
    const fullId = `${stageId}-${commandId}`;
    if (!this.state.completedCommands.includes(fullId)) {
      this.state.completedCommands.push(fullId);
      this.addXP(10, 'Command Learned');
      this.save();
      return true;
    }
    return false;
  },

  isCommandComplete(stageId, commandId) {
    return this.state.completedCommands.includes(`${stageId}-${commandId}`);
  },

  saveChallengeScore(stageId, score) {
    const currentHighest = this.state.challengeScores[stageId] || 0;
    if (score > currentHighest) {
      this.state.challengeScores[stageId] = score;
      this.save();
    }
  },

  checkStreak() {
    const today = new Date().toDateString();
    
    if (!this.state.lastActiveDate) {
      this.state.streakDays = 1;
      this.state.lastActiveDate = today;
      this.save();
      return;
    }

    if (this.state.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (this.state.lastActiveDate === yesterday.toDateString()) {
        // Streak continues
        this.state.streakDays++;
        window.Toast?.show(`🔥 ${this.state.streakDays} Day Streak!`, 'success');
      } else {
        // Streak broken
        this.state.streakDays = 1;
      }
      
      this.state.lastActiveDate = today;
      this.save();
    }
  }
};
