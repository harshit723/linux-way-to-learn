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
          { 
            cmd: 'pwd', 
            action: 'Print working directory', 
            description: 'Shows the full absolute path of the directory you are currently in.',
            syntax: 'pwd', 
            examples: ['pwd'],
            exampleResult: '/home/user'
          },
          { 
            cmd: 'ls', 
            action: 'List directory contents', 
            description: 'Lists files and directories in the current or specified directory.',
            syntax: 'ls [options] [path]', 
            examples: ['ls', 'ls -la', 'ls -lh'],
            exampleResult: 'total 4\ndrwxr-xr-x 2 user user 4096 Mar 13 22:00 .\ndrwxr-xr-x 3 root root 4096 Mar 13 21:00 ..\n-rw-r--r-- 1 user user   23 Mar 13 22:00 file.txt'
          },
          { 
            cmd: 'cd', 
            action: 'Change directory', 
            description: 'Changes the current working directory to the specified path.',
            syntax: 'cd [path]', 
            examples: ['cd /etc', 'cd ~', 'cd ..', 'cd -'],
            exampleResult: '(Current directory changes to /etc)'
          },
          { 
            cmd: 'tree', 
            action: 'Display directory tree', 
            description: 'Displays an interactive, recursive directory structure in a tree-like format.',
            syntax: 'tree [path]', 
            examples: ['tree', 'tree /var'],
            exampleResult: '.\n├── bin\n├── etc\n│   ├── passwd\n│   └── group\n└── home\n    └── user'
          }
        ]
      },
      {
        id: 'file-ops',
        title: 'File Operations',
        description: 'Create, read, update, move, and destroy files.',
        commands: [
          { 
            cmd: 'touch', 
            action: 'Create an empty file', 
            description: 'Creates a new empty file or updates the timestamp of an existing file.',
            syntax: 'touch [file]', 
            examples: ['touch notes.txt'],
            exampleResult: '(New file notes.txt is created)'
          },
          { 
            cmd: 'mkdir', 
            action: 'Create a directory', 
            description: 'Creates a new empty directory.',
            syntax: 'mkdir [options] [dir]', 
            examples: ['mkdir projects', 'mkdir -p a/b/c'],
            exampleResult: '(New directory projects is created)'
          },
          { 
            cmd: 'cp', 
            action: 'Copy file or directory', 
            description: 'Copies files or directories from one location to another.',
            syntax: 'cp [options] [src] [dest]', 
            examples: ['cp file.txt copy.txt', 'cp -r folder/ backup/'],
            exampleResult: '(File/folder is copied to the destination)'
          },
          { 
            cmd: 'mv', 
            action: 'Move or rename', 
            description: 'Moves files or directories to a new location, or renames them.',
            syntax: 'mv [src] [dest]', 
            examples: ['mv old.txt new.txt', 'mv file.txt /tmp/'],
            exampleResult: '(File/folder is moved or renamed)'
          },
          { 
            cmd: 'rm', 
            action: 'Remove file or directory', 
            description: 'Deletes files or directories.',
            syntax: 'rm [options] [file]', 
            examples: ['rm file.txt', 'rm -rf directory/'],
            exampleResult: '(File/folder is deleted)'
          },
          { 
            cmd: 'cat', 
            action: 'Concatenate and print', 
            description: 'Displays the contents of a file on the terminal.',
            syntax: 'cat [file]', 
            examples: ['cat /etc/passwd'],
            exampleResult: 'root:x:0:0:root:/root:/bin/bash\n...'
          }
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
          { 
            cmd: 'chmod', 
            action: 'Change permissions', 
            description: 'Changes the read, write, and execute permissions of a file or directory.',
            syntax: 'chmod [permissions] [file]', 
            examples: ['chmod 755 script.sh', 'chmod +x script.sh'],
            exampleResult: '(Permissions for script.sh are updated)'
          },
          { 
            cmd: 'chown', 
            action: 'Change ownership', 
            description: 'Changes the owner and/or group of a file or directory.',
            syntax: 'chown [owner]:[group] [file]', 
            examples: ['chown root:root file.txt'],
            exampleResult: '(Ownership of file.txt is updated)'
          },
          { 
             cmd: 'whoami', 
             action: 'Show current user', 
             description: 'Displays the username of the current user.',
             syntax: 'whoami', 
             examples: ['whoami'],
             exampleResult: 'user'
          },
          { 
             cmd: 'id', 
             action: 'Show user identity', 
             description: 'Displays the user and group IDs (UID/GID) for the current user.',
             syntax: 'id', 
             examples: ['id'],
             exampleResult: 'uid=1000(user) gid=1000(user) groups=1000(user),27(sudo)'
          },
          { 
             cmd: 'sudo', 
             action: 'Execute with root privileges', 
             description: 'Runs a command as the superuser (root) or another user.',
             syntax: 'sudo [command]', 
             examples: ['sudo apt update', 'sudo su -'],
             exampleResult: '[sudo] password for user: '
          }
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
          { 
            cmd: 'ps', 
            action: 'Display processes', 
            description: 'Provides information about the currently running processes.',
            syntax: 'ps [options]', 
            examples: ['ps aux', 'ps -ef'],
            exampleResult: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  10240  5120 ?        Ss   Mar13   0:01 /sbin/init'
          },
          { 
            cmd: 'top', 
            action: 'Interactive monitor', 
            description: 'Provides a dynamic real-time view of a running system.',
            syntax: 'top', 
            examples: ['top'],
            exampleResult: '(Interactive screen showing system load and processes)'
          },
          { 
            cmd: 'kill', 
            action: 'Terminate process', 
            description: 'Sends a signal to a process, usually to terminate it.',
            syntax: 'kill [PID]', 
            examples: ['kill 1234', 'kill -9 5678'],
            exampleResult: '(Process with PID is terminated)'
          }
        ]
      },
      {
        id: 'text',
        title: 'Text Processing Trio',
        description: 'grep, sed, and awk are the holy trinity of text manipulation.',
        commands: [
          { 
            cmd: 'grep', 
            action: 'Search text', 
            description: 'Searches for a specific pattern within a file or stream.',
            syntax: 'grep [pattern] [file]', 
            examples: ["grep 'root' /etc/passwd"],
            exampleResult: 'root:x:0:0:root:/root:/bin/bash'
          },
          { 
            cmd: 'sed', 
            action: 'Stream editor', 
            description: 'Performs basic text transformations on an input stream or file.',
            syntax: "sed 's/old/new/g' [file]", 
            examples: ["sed 's/user/admin/g' config.txt"],
            exampleResult: '(Content with replacements is displayed)'
          },
          { 
            cmd: '| (pipe)', 
            action: 'Chain commands', 
            description: 'Redirects the output of one command to the input of another.',
            syntax: 'cmd1 | cmd2', 
            examples: ['cat /etc/passwd | grep root'],
            exampleResult: 'root:x:0:0:root:/root:/bin/bash'
          }
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
          { 
            cmd: 'apt', 
            action: 'Package manager', 
            description: 'A powerful tool for managing software packages on Debian-based systems.',
            syntax: 'apt [action] [package]', 
            examples: ['sudo apt update', 'sudo apt install git'],
            exampleResult: 'Reading package lists... Done\nBuilding dependency tree... Done'
          },
          { 
            cmd: 'ping', 
            action: 'Test connectivity', 
            description: 'Checks if a remote host is reachable over the network.',
            syntax: 'ping [host]', 
            examples: ['ping google.com'],
            exampleResult: '64 bytes from ...: icmp_seq=1 ttl=118 time=15.2 ms'
          },
          { 
            cmd: 'ssh', 
            action: 'Secure Shell', 
            description: 'Provides a secure way to access a remote computer over an unsecured network.',
            syntax: 'ssh user@host', 
            examples: ['ssh root@192.168.1.1'],
            exampleResult: 'root@192.168.1.1 password: '
          }
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
          { 
            cmd: 'df', 
            action: 'Disk free space', 
            description: 'Displays the amount of available disk space on file systems.',
            syntax: 'df -h', 
            examples: ['df -h'],
            exampleResult: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   12G   38G  24% /'
          },
          { 
            cmd: 'systemctl', 
            action: 'Service manager', 
            description: 'Used to control the systemd system and service manager.',
            syntax: 'systemctl [action] [service]', 
            examples: ['systemctl status nginx', 'systemctl start docker'],
            exampleResult: '● nginx.service - A high performance web server\n   Loaded: loaded'
          },
          { 
            cmd: 'find', 
            action: 'Search files', 
            description: 'Searches for files in a directory hierarchy based on various criteria.',
            syntax: 'find [path] [criteria]', 
            examples: ["find /home -name '*.txt'"],
            exampleResult: '/home/user/notes.txt'
          },
          { 
            cmd: 'htop', 
            action: 'Interactive processes', 
            description: 'An interactive system-monitor process-viewer and process-manager.',
            syntax: 'htop', 
            examples: ['htop'],
            exampleResult: '(Interactive color-coded process viewer)'
          }
        ]
      }
    ]
  }
];
