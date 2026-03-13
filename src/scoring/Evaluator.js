import { Store } from '../store.js';
import { challenges } from '../data/challenges.js';

export class Evaluator {
  constructor(stageId, fs) {
    this.stageId = stageId;
    this.challenge = challenges[stageId];
    this.fs = fs;
    this.history = [];
    
    // UI callbacks
    this.onObjectiveComplete = null;
    this.onChallengeComplete = null;
    
    this.completedObjectives = new Set();
  }

  evaluate(cmdLine, newHistory) {
    if (!this.challenge) return;
    
    this.history = newHistory;
    let newCompletions = false;
    
    this.challenge.objectives.forEach(obj => {
      if (!this.completedObjectives.has(obj.id)) {
        try {
           if (obj.check(this.fs, this.history)) {
              this.completedObjectives.add(obj.id);
              newCompletions = true;
              if (this.onObjectiveComplete) {
                this.onObjectiveComplete(obj.id);
              }
           }
        } catch(e) {
          console.error('Evaluation error on objective', obj.id, e);
        }
      }
    });

    if (newCompletions && this.completedObjectives.size === this.challenge.objectives.length) {
      this.finishChallenge();
    }
  }

  finishChallenge() {
    // Calculate Score
    const commandCount = this.history.length;
    // Base score is max Score. Deduct points for taking too many commands (inefficiency)
    const optimalCommands = this.challenge.objectives.length * 1.5;
    let score = this.challenge.maxScore;
    
    if (commandCount > optimalCommands) {
      const penalty = Math.floor((commandCount - optimalCommands) * 5);
      score = Math.max(score * 0.5, score - penalty); // Never drop below 50% for completion
    }
    
    // Save to Store
    Store.saveChallengeScore(this.stageId, score);
    Store.addXP(score, `Completed ${this.challenge.title}`);
    
    if (this.onChallengeComplete) {
       this.onChallengeComplete(score);
    }
  }
}
