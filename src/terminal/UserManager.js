export class UserManager {
  constructor() {
    this.users = {
      'root': { uid: 0, gid: 0, home: '/root', shell: '/bin/bash' },
      'user': { uid: 1000, gid: 1000, home: '/home/user', shell: '/bin/bash' }
    };
    
    this.groups = {
      'root': { gid: 0, members: ['root'] },
      'user': { gid: 1000, members: ['user'] },
      'sudo': { gid: 27, members: ['user'] }
    };
    
    this.currentUser = 'user';
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserInfo(username = this.currentUser) {
    return this.users[username];
  }

  getUserGroups(username = this.currentUser) {
    return Object.entries(this.groups)
      .filter(([name, group]) => group.members.includes(username))
      .map(([name, group]) => ({ name, gid: group.gid }));
  }

  switchUser(username) {
    if (this.users[username]) {
      this.currentUser = username;
      return true;
    }
    return false;
  }
}
