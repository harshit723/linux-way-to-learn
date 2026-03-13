export class ProcessManager {
  constructor(userManager) {
    this.userManager = userManager;
    this.processes = [
      { pid: 1, user: 'root', '%cpu': 0.1, '%mem': 0.5, vsz: 104200, rss: 14200, tty: '?', stat: 'Ss', start: '10:00', time: '0:02', cmd: '/sbin/init' },
      { pid: 2, user: 'root', '%cpu': 0.0, '%mem': 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '10:00', time: '0:00', cmd: '[kthreadd]' },
      { pid: 56, user: 'systemd+', '%cpu': 0.0, '%mem': 0.3, vsz: 89000, rss: 8200, tty: '?', stat: 'Ss', start: '10:01', time: '0:00', cmd: '/lib/systemd/systemd-resolved' },
      { pid: 654, user: 'root', '%cpu': 0.0, '%mem': 0.2, vsz: 15400, rss: 5400, tty: '?', stat: 'Ss', start: '10:05', time: '0:00', cmd: 'sshd: /usr/sbin/sshd' },
      { pid: 890, user: 'nginx', '%cpu': 0.0, '%mem': 0.4, vsz: 142300, rss: 9800, tty: '?', stat: 'S', start: '10:10', time: '0:00', cmd: 'nginx: worker process' },
      { pid: 1450, user: 'user', '%cpu': 0.0, '%mem': 0.2, vsz: 11200, rss: 4500, tty: 'pts/0', stat: 'Ss', start: '11:00', time: '0:00', cmd: '-bash' }
    ];
    this.nextPid = 2000;
  }

  getProcesses() {
    return this.processes;
  }

  kill(pid, signal = 15) {
    const intPid = parseInt(pid, 10);
    const index = this.processes.findIndex(p => p.pid === intPid);
    if (index === -1) return { success: false, error: 'No such process' };
    
    const proc = this.processes[index];
    const currentUser = this.userManager.getCurrentUser();
    
    // Only root or owner can kill
    if (currentUser !== 'root' && proc.user !== currentUser) {
      return { success: false, error: 'Operation not permitted' };
    }
    
    // In a real system 9 is SIGKILL, 15 is SIGTERM
    this.processes.splice(index, 1);
    return { success: true };
  }
}
