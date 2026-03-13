export const stages = [
  {
    id: 'stage1',
    title: 'Stage 1: Foundations',
    duration: 'Weeks 1–2',
    description: 'Distros, Filesystem hierarchy, Terminal basics, File navigation.',
    icon: '🐧',
    categories: [
      {
        id: 'hierarchy',
        title: 'The Linux Filesystem Hierarchy',
        description: 'Everything in Linux is a file. The filesystem starts at / (root) and branches into key directories.',
        commands: [
          { cmd: '/bin', desc: 'Essential user binaries (ls, cp, mv, grep)' },
          { cmd: '/sbin', desc: 'System binaries for root (fdisk, ifconfig)' },
          { cmd: '/etc', desc: 'Configuration files for all programs' },
          { cmd: '/home', desc: 'Home directories for normal users' },
          { cmd: '/root', desc: 'Home directory for the root user' },
          { cmd: '/var', desc: 'Variable data: logs, databases, mail' },
          { cmd: '/tmp', desc: 'Temporary files — cleared on reboot' },
          { cmd: '/usr', desc: 'User programs, libraries, documentation' },
          { cmd: '/dev', desc: 'Device files (hard disks, USB, terminals)' }
        ]
      },
      {
        id: 'navigation',
        title: 'Navigation Commands',
        description: 'Move around the filesystem hierarchy seamlessly.',
        commands: [
          { cmd: 'pwd', action: 'Print current working directory', syntax: 'pwd', examples: ['pwd'] },
          { cmd: 'ls', action: 'List files and directories', syntax: 'ls [options] [path]', examples: ['ls', 'ls -la', 'ls -lh'] },
          { cmd: 'cd', action: 'Change directory', syntax: 'cd [path]', examples: ['cd /path', 'cd ~', 'cd ..', 'cd -'] },
          { cmd: 'tree', action: 'Visual directory tree', syntax: 'tree [path]', examples: ['tree'] }
        ]
      },
      {
        id: 'file-ops',
        title: 'File Operations',
        description: 'Create, read, update, move, and destroy files.',
        commands: [
          { cmd: 'touch', action: 'Create an empty file', syntax: 'touch [file]', examples: ['touch file.txt'] },
          { cmd: 'mkdir', action: 'Create a directory', syntax: 'mkdir [options] [dir]', examples: ['mkdir dir', 'mkdir -p a/b/c'] },
          { cmd: 'cp', action: 'Copy a file or directory', syntax: 'cp [options] [src] [dest]', examples: ['cp src dest', 'cp -r src dest'] },
          { cmd: 'mv', action: 'Move or rename a file/directory', syntax: 'mv [src] [dest]', examples: ['mv src dest'] },
          { cmd: 'rm', action: 'Delete a file or directory', syntax: 'rm [options] [file]', examples: ['rm file', 'rm -rf dir', 'rmdir dir'] },
          { cmd: 'cat', action: 'Print file contents', syntax: 'cat [file]', examples: ['cat file'] },
          { cmd: 'less', action: 'Page through a file', syntax: 'less [file]', examples: ['less file'] },
          { cmd: 'head', action: 'Show first N lines', syntax: 'head -n [lines] [file]', examples: ['head -n 20 file'] },
          { cmd: 'tail', action: 'Show last N lines', syntax: 'tail -n [lines] [file]', examples: ['tail -n 20 file', 'tail -f logfile'] },
          { cmd: 'wc', action: 'Count lines, words, chars', syntax: 'wc -l [file]', examples: ['wc -l file'] },
          { cmd: 'file', action: 'Determine file type', syntax: 'file [filename]', examples: ['file filename'] },
          { cmd: 'stat', action: 'Detailed file metadata', syntax: 'stat [file]', examples: ['stat file'] },
          { cmd: 'ln', action: 'Create a link', syntax: 'ln -s [target] [link]', examples: ['ln -s target link'] }
        ]
      }
    ]
  },
  {
    id: 'stage2',
    title: 'Stage 2: Files, Permissions & Users',
    duration: 'Weeks 3–4',
    description: 'chmod, chown, users & groups, sudo, file editing.',
    icon: '🔐',
    categories: [
      {
        id: 'permissions',
        title: 'Understanding Permissions',
        description: 'Manage read/write/execute rights for owner, group, and others.',
        commands: [
          { cmd: 'chmod', action: 'Change file permissions', syntax: 'chmod [permissions] [file]', examples: ['chmod 755 file', 'chmod +x file', 'chmod u-w file', 'chmod g+r file'] },
          { cmd: 'chown', action: 'Change owner and group', syntax: 'chown [owner]:[group] [file]', examples: ['chown user:group file', 'chown -R user dir'] },
          { cmd: 'umask', action: 'Set default permissions', syntax: 'umask [mask]', examples: ['umask 022'] }
        ]
      },
      {
        id: 'users',
        title: 'User & Group Management',
        description: 'Handle system identities and privileges.',
        commands: [
          { cmd: 'whoami', action: 'Show current user name', syntax: 'whoami', examples: ['whoami'] },
          { cmd: 'id', action: 'Show user info', syntax: 'id', examples: ['id'] },
          { cmd: 'su', action: 'Switch to another user', syntax: 'su - [user]', examples: ['su - root'] },
          { cmd: 'sudo', action: 'Run command with root privileges', syntax: 'sudo [command]', examples: ['sudo command', 'sudo -i'] },
          { cmd: 'useradd', action: 'Add a new user', syntax: 'useradd [options] [user]', examples: ['useradd username', 'useradd -m -s /bin/bash user'] },
          { cmd: 'usermod', action: 'Modify user properties', syntax: 'usermod [options] [user]', examples: ['usermod -aG group user'] },
          { cmd: 'userdel', action: 'Delete a user', syntax: 'userdel -r [user]', examples: ['userdel -r username'] },
          { cmd: 'passwd', action: 'Change password', syntax: 'passwd [user]', examples: ['passwd username'] },
          { cmd: 'groupadd', action: 'Create a new group', syntax: 'groupadd [group]', examples: ['groupadd groupname'] },
          { cmd: 'groups', action: 'List users groups', syntax: 'groups [user]', examples: ['groups username'] },
          { cmd: 'visudo', action: 'Safely edit sudoers', syntax: 'visudo', examples: ['sudo visudo'] }
        ]
      }
    ]
  },
  {
    id: 'stage3',
    title: 'Stage 3: Processes, Shell & Scripting',
    duration: 'Weeks 5–7',
    description: 'Bash scripting, pipes, grep/awk/sed, cron, signals.',
    icon: '⚙️',
    categories: [
      {
        id: 'processes',
        title: 'Process Management',
        description: 'Monitor and control running programs.',
        commands: [
          { cmd: 'ps', action: 'List running processes', syntax: 'ps [options]', examples: ['ps aux', 'ps aux | grep nginx'] },
          { cmd: 'top', action: 'Live process monitor', syntax: 'top', examples: ['top'] },
          { cmd: 'kill', action: 'Terminate process by ID', syntax: 'kill [PID]', examples: ['kill 1234', 'kill -9 1234'] },
          { cmd: 'killall', action: 'Kill processes by name', syntax: 'killall [name]', examples: ['killall nginx'] },
          { cmd: 'jobs', action: 'List background jobs', syntax: 'jobs', examples: ['jobs'] },
          { cmd: 'fg', action: 'Bring job to foreground', syntax: 'fg %[job_id]', examples: ['fg %1'] },
          { cmd: 'bg', action: 'Resume job in background', syntax: 'bg %[job_id]', examples: ['bg %1'] },
          { cmd: 'nohup', action: 'Run command that survives logout', syntax: 'nohup [cmd] &', examples: ['nohup ./script.sh &'] }
        ]
      },
      {
        id: 'text',
        title: 'Text Processing Trio',
        description: 'grep, sed, and awk are the holy trinity of text manipulation.',
        commands: [
          { cmd: 'grep', action: 'Search text', syntax: 'grep [pattern] [file]', examples: ["grep 'error' file", "grep -r 'error' /var", "grep -v 'debug' file"] },
          { cmd: 'sed', action: 'Stream Editor', syntax: "sed 's/old/new/g' [file]", examples: ["sed 's/foo/bar/g' file", "sed -i 's/foo/bar/g' file"] },
          { cmd: 'awk', action: 'Column/Field Processing', syntax: "awk '{print $1}' [file]", examples: ["awk '{print $1}' file", "awk -F: '{print $1}' /etc/passwd"] },
          { cmd: '| (pipe)', action: 'Chain commands together', syntax: 'cmd1 | cmd2', examples: ['cat file | grep error | wc -l'] },
          { cmd: '> / >>', action: 'Redirect output to file', syntax: 'cmd > file', examples: ['ls > list.txt', 'echo hello >> list.txt'] }
        ]
      }
    ]
  },
  {
    id: 'stage4',
    title: 'Stage 4: Networking & Packages',
    duration: 'Weeks 8–10',
    description: 'apt/yum/pacman, ssh, curl, netstat, firewall, DNS.',
    icon: '🌐',
    categories: [
       {
        id: 'packages',
        title: 'Package Management',
        description: 'Install, update, and remove software.',
        commands: [
          { cmd: 'apt', action: 'Debian/Ubuntu packages', syntax: 'apt [action] [package]', examples: ['apt update', 'apt install nginx', 'apt remove nginx'] }
        ]
       },
       {
        id: 'networking',
        title: 'Networking Commands',
        description: 'Configure interfaces, test connectivity, view ports.',
        commands: [
          { cmd: 'ip', action: 'Show IP addresses and routes', syntax: 'ip [obj]', examples: ['ip addr', 'ip route'] },
          { cmd: 'ping', action: 'Test connectivity', syntax: 'ping [host]', examples: ['ping google.com', 'ping -c 4 8.8.8.8'] },
          { cmd: 'netstat', action: 'Show network status', syntax: 'netstat [options]', examples: ['netstat -tulpn'] },
          { cmd: 'curl', action: 'Fetch URL content', syntax: 'curl [url]', examples: ['curl http://example.com'] },
          { cmd: 'wget', action: 'Download files', syntax: 'wget [url]', examples: ['wget http://example.com/file.zip'] },
          { cmd: 'ufw', action: 'Firewall config', syntax: 'ufw [action]', examples: ['ufw status', 'ufw allow 22'] }
        ]
       },
       {
        id: 'ssh',
        title: 'Secure Shell (SSH)',
        description: 'Remote access and secure copy.',
        commands: [
          { cmd: 'ssh', action: 'Connect to remote host', syntax: 'ssh user@host', examples: ['ssh root@192.168.1.10'] },
          { cmd: 'scp', action: 'Secure copy files', syntax: 'scp [src] [dest]', examples: ['scp file.txt user@host:/tmp'] },
          { cmd: 'ssh-keygen', action: 'Generate SSH keys', syntax: 'ssh-keygen', examples: ['ssh-keygen'] }
        ]
       }
    ]
  },
  {
    id: 'stage5',
    title: 'Stage 5: Sysadmin & Security',
    duration: 'Weeks 11–14',
    description: 'systemd, disk management, logs, hardening.',
    icon: '🛡️',
    categories: [
      {
        id: 'systemd',
        title: 'Service Management (systemd)',
        description: 'Start, stop, and enable background services.',
        commands: [
          { cmd: 'systemctl', action: 'Manage system services', syntax: 'systemctl [action] [service]', examples: ['systemctl status nginx', 'systemctl restart nginx', 'systemctl enable nginx'] },
          { cmd: 'journalctl', action: 'View system logs', syntax: 'journalctl [options]', examples: ['journalctl -u nginx', 'journalctl -f'] }
        ]
      },
      {
        id: 'disk',
        title: 'Disk & Storage',
        description: 'Monitor space, mounts, and filesystems.',
        commands: [
          { cmd: 'df', action: 'Disk free space', syntax: 'df -h', examples: ['df -h'] },
          { cmd: 'du', action: 'Disk usage by directory', syntax: 'du -sh [dir]', examples: ['du -sh /var'] },
          { cmd: 'mount', action: 'Mount filesystem', syntax: 'mount [device] [dir]', examples: ['mount /dev/sda1 /mnt'] }
        ]
      }
    ]
  },
  {
    id: 'stage6',
    title: 'Stage 6: Advanced Commands',
    duration: 'Weeks 15+',
    description: 'find, performance tuning, system tracking.',
    icon: '🚀',
    categories: [
      {
         id: 'find',
         title: 'The "find" Command',
         description: 'Search for files by deeply nested criteria.',
         commands: [
           { cmd: 'find', action: 'Search filesystem hierarchy', syntax: 'find [path] [criteria]', examples: ["find /var -name '*.log'", "find / -type f -size +100M", "find . -mtime -7"] }
         ]
      },
      {
         id: 'perf',
         title: 'Performance Monitoring',
         description: 'Deep dive into what your system is doing.',
         commands: [
           { cmd: 'htop', action: 'Interactive process viewer', syntax: 'htop', examples: ['htop'] },
           { cmd: 'strace', action: 'Trace system calls', syntax: 'strace -p [PID]', examples: ['strace -p 1234'] },
           { cmd: 'lsof', action: 'List open files', syntax: 'lsof [options]', examples: ['lsof', 'lsof -i :80'] }
         ]
      }
    ]
  }
];
