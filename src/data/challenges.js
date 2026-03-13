export const challenges = {
  'stage1': {
    title: 'Filesystem Basics',
    description: 'Prove you know how to navigate and manage files.',
    timeLimit: 120, // seconds
    maxScore: 100,
    objectives: [
      {
        id: 'c1',
        text: 'Create a directory called "assignments"',
        check: (fs, history) => fs.get('/home/user/assignments')?.type === 'dir'
      },
      {
        id: 'c2',
        text: 'Navigate into "assignments"',
        check: (fs, history) => history.some(cmd => cmd.startsWith('cd ') && cmd.includes('assignments'))
      },
      {
        id: 'c3',
        text: 'Create an empty file named "report.txt"',
        check: (fs, history) => fs.get('/home/user/assignments/report.txt')?.type === 'file'
      }
    ]
  },
  'stage2': {
    title: 'Permission Master',
    description: 'Secure your files!',
    timeLimit: 180,
    maxScore: 150,
    objectives: [
      {
        id: 'c1',
        text: 'Create a file named "secret.txt"',
        check: (fs) => fs.get('/home/user/secret.txt') !== undefined
      },
      {
        id: 'c2',
        text: 'Remove read permission for others (chmod o-r secret.txt)',
        check: (fs) => {
          const file = fs.get('/home/user/secret.txt');
          return file && (file.permissions & 0o004) === 0;
        }
      }
    ]
  }
};
