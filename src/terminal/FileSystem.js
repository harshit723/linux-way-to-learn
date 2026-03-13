export class FileSystem {
  constructor() {
    this.root = {
      type: 'dir',
      name: '',
      permissions: 0o755,
      owner: 'root',
      group: 'root',
      mtime: Date.now(),
      children: {}
    };
    
    this.pwd = '/home/user';
    this.initDefaultSystem();
  }

  initDefaultSystem() {
    ['bin', 'sbin', 'etc', 'home', 'root', 'var', 'tmp', 'usr', 'dev'].forEach(dir => {
      this.mkdir(`/${dir}`, 'root', 'root');
    });
    
    // User home
    this.mkdir('/home/user', 'user', 'user');
    
    // Sample files
    this.touch('/etc/passwd', 'root', 'root', 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash');
    this.touch('/etc/group', 'root', 'root', 'root:x:0:\nuser:x:1000:\nsudo:x:27:user');
    this.touch('/var/log/syslog', 'root', 'adm', 'systemd[1]: Started fake system log.\nkernel: Linux version 5.15.0');
    this.touch('/home/user/.bashrc', 'user', 'user', '# ~/.bashrc\nalias ll="ls -la"');
    
    // Set some specific permissions
    this.chmod('/etc/passwd', 0o644);
    this.chmod('/etc/group', 0o644);
    this.chmod('/var/log/syslog', 0o640);
  }

  // Path resolution
  resolvePath(path) {
    if (!path) return this.pwd;
    if (path === '~') return '/home/user';
    if (path.startsWith('~/')) return `/home/user/${path.substring(2)}`;
    
    let parts = path.split('/').filter(p => p !== '');
    let currentPath = path.startsWith('/') ? [] : this.pwd.split('/').filter(p => p !== '');
    
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (currentPath.length > 0) currentPath.pop();
      } else {
        currentPath.push(part);
      }
    }
    
    return '/' + currentPath.join('/');
  }

  getParentPath(path) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return '/';
    const parts = resolved.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }

  getBasename(path) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return '';
    return resolved.split('/').pop();
  }

  // Core operations
  get(path) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.root;
    
    const parts = resolved.split('/').filter(p => p !== '');
    let current = this.root;
    
    for (const part of parts) {
      if (current.type !== 'dir' || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    
    return current;
  }

  mkdir(path, owner = 'user', group = 'user', p = false) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return { success: false, error: 'File exists' };
    
    const parentPath = this.getParentPath(resolved);
    const basename = this.getBasename(resolved);
    
    let parent = this.get(parentPath);
    
    if (!parent && p) {
      // Recursive mkdir (mkdir -p) logic would go here
      // For simplicity in this demo, we assume parents exist or we fail
      return { success: false, error: 'No such file or directory' };
    }
    
    if (!parent || parent.type !== 'dir') {
      return { success: false, error: 'No such file or directory' };
    }
    
    if (parent.children[basename]) {
      return { success: false, error: 'File exists' };
    }
    
    parent.children[basename] = {
      type: 'dir',
      name: basename,
      permissions: 0o755,
      owner,
      group,
      mtime: Date.now(),
      children: {}
    };
    
    return { success: true };
  }

  touch(path, owner = 'user', group = 'user', content = '') {
    const resolved = this.resolvePath(path);
    const parentPath = this.getParentPath(resolved);
    const basename = this.getBasename(resolved);
    
    const parent = this.get(parentPath);
    if (!parent || parent.type !== 'dir') {
      return { success: false, error: 'No such file or directory' };
    }
    
    if (parent.children[basename]) {
      parent.children[basename].mtime = Date.now();
      return { success: true };
    }
    
    parent.children[basename] = {
      type: 'file',
      name: basename,
      permissions: 0o644,
      owner,
      group,
      mtime: Date.now(),
      content
    };
    
    return { success: true };
  }

  read(path) {
    const node = this.get(path);
    if (!node) return { success: false, error: 'No such file or directory' };
    if (node.type === 'dir') return { success: false, error: 'Is a directory' };
    return { success: true, content: node.content };
  }

  write(path, content, append = false, owner = 'user', group = 'user') {
    const node = this.get(path);
    if (node) {
      if (node.type === 'dir') return { success: false, error: 'Is a directory' };
      node.content = append ? (node.content + content) : content;
      node.mtime = Date.now();
      return { success: true };
    }
    
    return this.touch(path, owner, group, content);
  }

  rm(path, recursive = false) {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return { success: false, error: 'Permission denied' };
    
    const parentPath = this.getParentPath(resolved);
    const basename = this.getBasename(resolved);
    const parent = this.get(parentPath);
    
    if (!parent || !parent.children[basename]) {
      return { success: false, error: 'No such file or directory' };
    }
    
    const node = parent.children[basename];
    if (node.type === 'dir' && !recursive) {
      if (Object.keys(node.children).length > 0) {
        return { success: false, error: 'Directory not empty' };
      }
    }
    
    delete parent.children[basename];
    return { success: true };
  }

  chmod(path, mode) {
    const node = this.get(path);
    if (!node) return { success: false, error: 'No such file or directory' };
    node.permissions = typeof mode === 'string' ? parseInt(mode, 8) : mode;
    return { success: true };
  }
  
  chown(path, newOwner, newGroup) {
      const node = this.get(path);
      if (!node) return { success: false, error: 'No such file or directory' };
      if (newOwner) node.owner = newOwner;
      if (newGroup) node.group = newGroup;
      return { success: true };
  }
}
