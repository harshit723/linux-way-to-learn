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
    ['bin', 'sbin', 'etc', 'home', 'root', 'var', 'tmp', 'usr', 'dev', 'lib', 'lib64', 'media', 'mnt', 'opt', 'proc', 'run', 'sys', 'srv'].forEach(dir => {
      this.mkdir(`/${dir}`, 'root', 'root');
    });

    // Deep directories
    ['var/log', 'var/cache', 'var/lib', 'var/run', 'usr/bin', 'usr/sbin', 'usr/lib', 'usr/local', 'usr/local/bin', 'usr/share', 'etc/ssh', 'etc/nginx', 'etc/apt'].forEach(dir => {
        this.mkdir(`/${dir}`, 'root', 'root', true);
    });
    
    // User home
    this.mkdir('/home/user', 'user', 'user');
    this.mkdir('/home/user/documents', 'user', 'user');
    this.mkdir('/home/user/downloads', 'user', 'user');
    this.mkdir('/home/user/.config', 'user', 'user');
    
    // Config files
    this.touch('/etc/passwd', 'root', 'root', 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nuser:x:1000:1000:user:/home/user:/bin/bash\n');
    this.touch('/etc/group', 'root', 'root', 'root:x:0:\ndaemon:x:1:\nbin:x:2:\nsys:x:3:\nadm:x:4:syslog,user\nuser:x:1000:\nsudo:x:27:user\n');
    this.touch('/etc/hostname', 'root', 'root', 'linuxlab\n');
    this.touch('/etc/hosts', 'root', 'root', '127.0.0.1\tlocalhost\n127.0.1.1\tlinuxlab\n\n# The following lines are desirable for IPv6 capable hosts\n::1     ip6-localhost ip6-loopback\n');
    this.touch('/etc/resolv.conf', 'root', 'root', 'nameserver 8.8.8.8\nnameserver 8.8.4.4\n');
    this.touch('/etc/fstab', 'root', 'root', '# /etc/fstab: static file system information.\n#\n# <file system> <mount point>   <type>  <options>       <dump>  <pass>\n/dev/sda1       /               ext4    errors=remount-ro 0       1\n');
    this.touch('/etc/ssh/sshd_config', 'root', 'root', 'Port 22\nPermitRootLogin no\nPasswordAuthentication yes\nChallengeResponseAuthentication no\nUsePAM yes\nX11Forwarding yes\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n');

    // Mocks for /bin (executable mocks)
    const bins = ['ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'touch', 'cp', 'mv', 'grep', 'find', 'tar', 'gzip', 'chmod', 'chown', 'ps', 'kill', 'bash', 'sh'];
    bins.forEach(b => {
        this.touch(`/bin/${b}`, 'root', 'root', `\x7fELF... this is a mock binary for ${b}`);
        this.chmod(`/bin/${b}`, 0o755);
    });

    // Mocks for /usr/bin
    const usrbins = ['awk', 'sed', 'sort', 'uniq', 'wc', 'head', 'tail', 'diff', 'cmp', 'less', 'more', 'nano', 'vim', 'top', 'free', 'uptime', 'whoami', 'id', 'wget', 'curl', 'nc', 'ssh', 'python3', 'node'];
    usrbins.forEach(b => {
        this.touch(`/usr/bin/${b}`, 'root', 'root', `\x7fELF... this is a mock binary for ${b}`);
        this.chmod(`/usr/bin/${b}`, 0o755);
    });

    // Mocks for /sbin & /usr/sbin
    const sbins = ['ifconfig', 'ip', 'netstat', 'ss', 'sudo', 'su', 'fdisk', 'mount'];
    sbins.forEach(b => {
       this.touch(`/sbin/${b}`, 'root', 'root', `\x7fELF... sbin mock`);
       this.chmod(`/sbin/${b}`, 0o755);
    });

    // System logs
    this.touch('/var/log/syslog', 'root', 'adm', 'systemd[1]: Started fake system log.\nkernel: Linux version 5.15.0-generic (buildd@lcy02-amd64-077) (gcc (Ubuntu 11.2.0-19ubuntu1) 11.2.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #68-Ubuntu SMP Wed Jul 12 14:17:42 UTC 2023\nsystemd[1]: NetworkManager.service: Succeeded.\n');
    this.touch('/var/log/auth.log', 'root', 'adm', 'sshd[4123]: Accepted publickey for user from 192.168.1.100 port 50123 ssh2\nsudo: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/bash\n');
    this.touch('/var/log/dmesg', 'root', 'adm', '[    0.000000] Linux version 5.15.0-generic\n[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-generic\n[    0.693421] ACPI: Added _OSI(Module Device)\n[    1.234567] e1000e: eth0 NIC Link is Up 1000 Mbps Full Duplex, Flow Control: Rx/Tx\n');

    // Home files
    this.touch('/home/user/.bashrc', 'user', 'user', '# ~/.bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\nexport PS1="\\u@\\h:\\w\\$ "\n');
    this.touch('/home/user/.profile', 'user', 'user', '# ~/.profile: executed by the command interpreter for login shells.\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\nPATH="$HOME/bin:$HOME/.local/bin:$PATH"\n');
    this.touch('/home/user/documents/notes.txt', 'user', 'user', 'TODO:\n- Learn more about Linux file permissions\n- Practice piping commands (grep, awk)\n- Build a cool script for automation\n');
    this.touch('/home/user/documents/hello.c', 'user', 'user', '#include <stdio.h>\n\nint main() {\n    printf("Hello, Linux World!\\n");\n    return 0;\n}\n');

    // Permissions setup
    this.chmod('/etc/passwd', 0o644);
    this.chmod('/etc/group', 0o644);
    this.chmod('/etc/shadow', 0o640);
    this.chmod('/etc/sudoers', 0o440);
    this.chmod('/var/log/syslog', 0o640);
    this.chmod('/var/log/auth.log', 0o640);
    this.chmod('/var/log/dmesg', 0o640);
    
    // SUID mock for sudo
    this.chmod('/sbin/sudo', 0o4755);
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
    
    const parts = resolved.split('/').filter(part => part !== '');
    let current = this.root;
    
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current.children[part]) {
            if (p) {
                current.children[part] = {
                    type: 'dir',
                    name: part,
                    permissions: 0o755,
                    owner, group,
                    mtime: Date.now(),
                    children: {}
                };
            } else {
                return { success: false, error: 'No such file or directory' };
            }
        } else if (current.children[part].type !== 'dir') {
            return { success: false, error: 'Not a directory' };
        }
        current = current.children[part];
    }
    
    const basename = parts[parts.length - 1];
    
    if (current.children[basename]) {
      return { success: false, error: 'File exists' };
    }
    
    current.children[basename] = {
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
      if (parent.children[basename].type === 'dir') return { success: false, error: 'Is a directory' };
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
