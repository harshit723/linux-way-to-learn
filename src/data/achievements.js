export const achievements = [
  {
    id: 'first-blood',
    title: 'First Command',
    description: 'Executed your first command in the virtual terminal.',
    icon: '💻', // Or an SVG 
    condition: (state) => state.xp >= 10
  },
  {
    id: 'stage1-master',
    title: 'Foundation Built',
    description: 'Completed Stage 1 Challenge with > 80% score.',
    icon: '🏗️',
    condition: (state) => state.challengeScores['stage1'] >= 80
  },
  {
    id: 'streak-7',
    title: 'Dedicated Learner',
    description: 'Maintained a 7-day streak.',
    icon: '🔥',
    condition: (state) => state.streakDays >= 7
  }
];
