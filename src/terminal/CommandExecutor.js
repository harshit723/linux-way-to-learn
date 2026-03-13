export class CommandExecutor {
  constructor(fs, userManager, processManager) {
    this.fs = fs;
    this.users = userManager;
    this.procs = processManager;
    
    // Commands that take a long time and need to be interrupted (like ping)
    // For this simple sync executor, we'll fake the output
  }

  execute(cmdLine, terminalContext) {
    if (!cmdLine || !cmdLine.trim()) return '';
    
    // Add to history
    terminalContext.history.push(cmdLine);
    
    // Handle pipes
    if (cmdLine.includes('|')) {
      return this.executePipeline(cmdLine, terminalContext);
    }
    
    // Handle output redirection > and >>
    let redirectFile = null;
    let append = false;
    let splitCmd = cmdLine;
    
    if (cmdLine.includes('>>')) {
      const parts = cmdLine.split('>>');
      splitCmd = parts[0].trim();
      redirectFile = parts[1].trim();
      append = true;
    } else if (cmdLine.includes('>')) {
      const parts = cmdLine.split('>');
      splitCmd = parts[0].trim();
      redirectFile = parts[1].trim();
    }
    
    const output = this.evaluateSingleCommand(splitCmd, terminalContext);
    
    if (redirectFile) {
        const res = this.fs.write(redirectFile, output, append, this.users.getCurrentUser(), this.users.getCurrentUser());
        if (!res.success) return `bash: ${redirectFile}: ${res.error}\n`;
        return '';
    }
    
    return output;
  }
  
  executePipeline(cmdLine, terminalContext) {
    const cmds = cmdLine.split('|').map(c => c.trim());
    let currentInput = null;
    let finalOutput = '';
    
    for (let i = 0; i < cmds.length; i++) {
        // We pass the output of the previous command as input to the next
        // For simplicity in this demo, we'll only support simple grep/wc chaining
        const out = this.evaluateSingleCommand(cmds[i], terminalContext, currentInput);
        currentInput = out;
        if (i === cmds.length - 1) finalOutput = out;
    }
    return finalOutput;
  }

  evaluateSingleCommand(cmdLine, terminalContext, pipelineInput = null) {
    const args = this.parseArgs(cmdLine);
    const cmd = args[0];
    
    try {
      switch (cmd) {
        // Navigation & File Ops
        case 'pwd': return this.fs.pwd + '\n';
        case 'cd': return this.cmdCd(args);
        case 'ls': return this.cmdLs(args);
        case 'mkdir': return this.cmdMkdir(args);
        case 'touch': return this.cmdTouch(args);
        case 'rm': return this.cmdRm(args);
        case 'cp': return this.cmdCp(args);
        case 'mv': return this.cmdMv(args);
        case 'find': return this.cmdFind(args);
        case 'tree': return this.cmdTree(args);
        case 'ln': return this.cmdLn(args);
        case 'file': return this.cmdFile(args);
        case 'cat': return pipelineInput ? pipelineInput : this.cmdCat(args);
        case 'head': return this.cmdHead(args, pipelineInput);
        case 'tail': return this.cmdTail(args, pipelineInput);
        case 'wc': return this.cmdWc(args, pipelineInput);
        
        // Permissions / Users
        case 'chmod': return this.cmdChmod(args);
        case 'chown': return this.cmdChown(args);
        case 'whoami': return this.users.getCurrentUser() + '\n';
        case 'id': return `uid=${this.users.getUserInfo().uid}(${this.users.getCurrentUser()}) gid=${this.users.getUserInfo().gid} groups=1000(${this.users.getCurrentUser()}),4(adm),27(sudo)\n`;
        case 'su': return this.cmdSu(args);
        case 'sudo': return this.cmdSudo(args, terminalContext);
        case 'users': return this.users.getCurrentUser() + '\n';
        case 'who': return `${this.users.getCurrentUser()} \t tty1 \t ${new Date().toISOString().split('T')[0]} 08:00\n`;
        case 'w': return ` 08:00:00 up 1 day, user, load average: 0.00, 0.01, 0.05\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\n${this.users.getCurrentUser()} user     -                08:00    1.00s  0.05s  0.01s -bash\n`;
        case 'last': return `${this.users.getCurrentUser()}    tty1         Mon Jan 1 08:00   still logged in\nreboot   system boot  Mon Jan 1 00:00\n`;
        
        // Grep & Text Processing
        case 'grep': return this.cmdGrep(args, pipelineInput);
        case 'awk': return this.cmdAwk(args, pipelineInput);
        case 'sed': return this.cmdSed(args, pipelineInput);
        case 'sort': return this.cmdSort(args, pipelineInput);
        case 'uniq': return this.cmdUniq(args, pipelineInput);
        case 'less':
        case 'more': return pipelineInput ? pipelineInput : this.cmdCat(args); // Mock as cat for now
        case 'diff': return this.cmdDiff(args);
        case 'cmp': return this.cmdCmp(args);
        
        // Processes & System Info
        case 'ps': return this.cmdPs(args);
        case 'kill': return this.cmdKill(args);
        case 'top': return this.cmdTop();
        case 'free': return this.cmdFree();
        case 'df': return this.cmdDf();
        case 'du': return this.cmdDu(args);
        case 'uptime': return ` 08:00:00 up 1 day,  1 user,  load average: 0.00, 0.01, 0.05\n`;
        case 'uname': return args.includes('-a') ? `Linux linuxlab 5.15.0-generic #1 SMP x86_64 GNU/Linux\n` : `Linux\n`;
        case 'hostname': return `linuxlab\n`;
        case 'env':
        case 'export': return `USER=${this.users.getCurrentUser()}\nHOME=${this.users.getUserInfo().home}\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nSHELL=/bin/bash\nTERM=xterm-256color\n`;
        
        // Network (Mocked)
        case 'ping': return `PING ${args[1] || '8.8.8.8'} (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=10.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=9.5 ms\n64 bytes from 8.8.8.8: icmp_seq=3 ttl=115 time=10.1 ms\n64 bytes from 8.8.8.8: icmp_seq=4 ttl=115 time=9.8 ms\n`;
        case 'curl': return args[1] ? `<!DOCTYPE html>\n<html>\n<body>\n<h1>Success</h1>\n<p>Fetched from ${args[1]}</p>\n</body>\n</html>\n` : `curl: try 'curl --help'\n`;
        case 'wget': return args[1] ? `--2026-01-01 08:00:00--  ${args[1]}\nResolving ${args[1]}... 1.2.3.4\nConnecting to 1.2.3.4:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1.0K) [text/html]\nSaving to: 'index.html'\n\n     0K .                                                     100% 2.00M=0s\n\n2026-01-01 08:00:00 (2.00 MB/s) - 'index.html' saved [1024/1024]\n` : `wget: missing URL\n`;
        case 'ifconfig':
        case 'ip': return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>\n        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)\n        RX packets 12345  bytes 12345678 (12.3 MB)\n        TX packets 54321  bytes 87654321 (87.6 MB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)\n`;
        case 'netstat':
        case 'ss': return `Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 192.168.1.100:22        192.168.1.50:50123      ESTABLISHED\ntcp        0      0 192.168.1.100:443       10.0.0.5:43912          TIME_WAIT\n`;
        case 'nmap': return `Starting Nmap 7.80 ( https://nmap.org ) at 2026-01-01 08:00 UTC\nNmap scan report for ${args[1] || 'localhost'}\nHost is up (0.0001s latency).\nNot shown: 998 closed ports\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http\n\nNmap done: 1 IP address (1 host up) scanned in 0.12 seconds\n`;
        case 'ssh': return args[1] ? `The authenticity of host '${args[1]}' can't be established.\nECDSA key fingerprint is SHA256:abcd1234efgh5678.\nAre you sure you want to continue connecting (yes/no/[fingerprint])? \nHost key verification failed.\n` : `usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] [-b bind_address] [-c cipher_spec] [-D [bind_address:]port] [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11] [-i identity_file] [-J [user@]host[:port]] [-L address] [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port] [-Q query_option] [-R address] [-S ctl_path] [-W host:port] [-w local_tun[:remote_tun]] destination [command]\n`;
        case 'nc': return `Ncat: Connection refused.\n`;
        
        // Archives
        case 'tar': return this.cmdTar(args);
        case 'gzip': return this.cmdGzip(args);
        case 'zip': return args[1] ? `  adding: ${args[1]} (stored 0%)\n` : `zip error: Nothing to do!\n`;
        case 'unzip': return args[1] ? `Archive:  ${args[1]}\n  inflating: extracted_file.txt\n` : `unzip:  cannot find or open archive\n`;
        
        // Editors / Viewers
        case 'nano':
        case 'vim':
        case 'vi': return `bash: ${cmd}: interactive terminals not supported in this mock GUI. Try using 'cat' or 'echo >' instead.\n`;
        
        // Utils
        case 'echo': return args.slice(1).join(' ').replace(/["']/g, '') + '\n';
        case 'clear': 
          terminalContext.clearScreen(); 
          return '';
        case 'history': 
          return terminalContext.history.map((h, i) => `  ${i+1}  ${h}`).join('\n') + '\n';
        case 'date': return new Date().toString() + '\n';
        case 'alias': return `alias grep='grep --color=auto'\nalias ll='ls -la'\nalias ls='ls --color=auto'\n`;
        case 'unalias': return `\n`;
        case 'which': return args[1] ? `/usr/bin/${args[1]}\n` : `\n`;
        case 'whereis': return args[1] ? `${args[1]}: /usr/bin/${args[1]} /usr/share/man/man1/${args[1]}.1.gz\n` : `\n`;
        case 'man': return args[1] ? `MANUAL PAGE FOR ${args[1].toUpperCase()}\n\nNAME\n       ${args[1]} - mock implementation\n\nSYNOPSIS\n       ${args[1]} [OPTIONS]... [FILE]...\n\nDESCRIPTION\n       This is a mock implementation of ${args[1]} for the Linux Lab.\n` : `What manual page do you want?\n`;
        
        default: return `bash: ${cmd}: command not found\n`;
      }
    } catch (e) {
      return `bash: ${cmd}: ${e.message}\n`;
    }
  }

  parseArgs(cmdLine) {
    // Basic space parser (doesn't handle quotes perfectly yet)
    return cmdLine.split(/\s+/).filter(a => a.length > 0);
  }

  cmdCd(args) {
    const target = args[1] || '~';
    const resolved = this.fs.resolvePath(target);
    const node = this.fs.get(resolved);
    
    if (!node) return `bash: cd: ${target}: No such file or directory\n`;
    if (node.type !== 'dir') return `bash: cd: ${target}: Not a directory\n`;
    
    this.fs.pwd = resolved;
    return '';
  }

  cmdLs(args) {
    let longFormat = false;
    let showHidden = false;
    let target = this.fs.pwd;
    
    args.slice(1).forEach(arg => {
      if (arg.startsWith('-')) {
        if (arg.includes('l')) longFormat = true;
        if (arg.includes('a')) showHidden = true;
      } else {
        target = this.fs.resolvePath(arg);
      }
    });

    const node = this.fs.get(target);
    if (!node) return `ls: cannot access '${target}': No such file or directory\n`;
    if (node.type === 'file') return target + '\n'; // Simplify
    
    let output = '';
    const children = Object.values(node.children).sort((a,b) => a.name.localeCompare(b.name));
    
    for (const child of children) {
      if (!showHidden && child.name.startsWith('.')) continue;
      
      if (longFormat) {
        const typeChar = child.type === 'dir' ? 'd' : '-';
        // Simplify permissions for visual output
        const perms = (child.permissions & 0o777).toString(8);
        const permStr = typeChar + this.permStringToRwx(perms);
        const size = child.type === 'dir' ? '4096' : (child.content ? child.content.length : 0);
        const date = new Date(child.mtime).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit'});
        
        output += `${permStr} 1 ${child.owner} ${child.group} ${size.toString().padStart(6)} ${date} ${child.name}${child.type === 'dir'?'/':''}\n`;
      } else {
        output += `${child.name}${child.type === 'dir'?'/':''}  `;
      }
    }
    
    return longFormat ? output : output + '\n';
  }
  
  permStringToRwx(octalStr) {
    const map = {'0': '---', '1': '--x', '2': '-w-', '3': '-wx', '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx'};
    return map[octalStr[0]] + map[octalStr[1]] + map[octalStr[2]];
  }

  cmdMkdir(args) {
    if (!args[1]) return `mkdir: missing operand\n`;
    let isP = args.includes('-p');
    let target = args[args.length - 1]; // very naive
    
    const res = this.fs.mkdir(target, this.users.getCurrentUser(), this.users.getCurrentUser(), isP);
    if (!res.success) return `mkdir: cannot create directory '${target}': ${res.error}\n`;
    return '';
  }

  cmdTouch(args) {
    if (!args[1]) return `touch: missing file operand\n`;
    const res = this.fs.touch(args[1], this.users.getCurrentUser(), this.users.getCurrentUser());
    if (!res.success) return `touch: cannot touch '${args[1]}': ${res.error}\n`;
    return '';
  }

  cmdRm(args) {
    if (!args[1]) return `rm: missing operand\n`;
    let recursive = args.includes('-r') || args.includes('-rf');
    let target = args[args.length - 1];
    
    const res = this.fs.rm(target, recursive);
    if (!res.success) return `rm: cannot remove '${target}': ${res.error}\n`;
    return '';
  }

  cmdCat(args) {
    if (!args[1]) return '';
    const res = this.fs.read(args[1]);
    if (!res.success) return `cat: ${args[1]}: ${res.error}\n`;
    return res.content + (res.content.endsWith('\n') ? '' : '\n');
  }

  cmdChmod(args) {
    if (args.length < 3) return `chmod: missing operand\n`;
    const res = this.fs.chmod(args[2], args[1]);
    if (!res.success) return `chmod: cannot access '${args[2]}': ${res.error}\n`;
    return '';
  }

  cmdChown(args) {
    if (args.length < 3) return `chown: missing operand\n`;
    const parts = args[1].split(':');
    const res = this.fs.chown(args[2], parts[0], parts[1]);
    if (!res.success) return `chown: cannot access '${args[2]}': ${res.error}\n`;
    return '';
  }
  
  cmdSu(args) {
      const target = args[args.length - 1] === '-' ? 'root' : (args[args.length - 1] === 'su' ? 'root' : args[args.length - 1]);
      if (this.users.switchUser(target)) {
          this.fs.pwd = this.users.getUserInfo(target).home;
          return `Switched to ${target}\n`;
      }
      return `su: user ${target} does not exist\n`;
  }
  
  cmdSudo(args, ctx) {
      if (args.length < 2) return `usage: sudo command\n`;
      const prevUser = this.users.getCurrentUser();
      this.users.switchUser('root');
      // recursively evaluate the inner command
      const output = this.evaluateSingleCommand(args.slice(1).join(' '), ctx);
      this.users.switchUser(prevUser);
      return output;
  }
  
  cmdPs(args) {
      let out = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n';
      this.procs.getProcesses().forEach(p => {
         out += `${p.user.padEnd(8)} ${p.pid.toString().padStart(5)} ${p['%cpu'].toString().padStart(4)} ${p['%mem'].toString().padStart(4)} ${p.vsz.toString().padStart(6)} ${p.rss.toString().padStart(5)} ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} ${p.start} ${p.time.padStart(6)} ${p.cmd}\n`; 
      });
      return out;
  }
  
  cmdKill(args) {
      if (!args[1]) return `kill: usage: kill [-s sigspec | -n signum | -sigspec] pid\n`;
      let pid = args[1];
      if (args[1].startsWith('-')) pid = args[2];
      const res = this.procs.kill(pid);
      if (!res.success) return `bash: kill: (${pid}) - ${res.error}\n`;
      return '';
  }
  
  // Basic grep implementation
  cmdGrep(args, input) {
    const pattern = args.find(a => !a.startsWith('-') && a !== 'grep');
    let target = args[args.length - 1];
    
    let content = '';
    if (input) {
      content = input;
    } else {
      if (!pattern || target === pattern) return `Usage: grep [OPTION]... PATTERNS [FILE]...\n`;
      const res = this.fs.read(target);
      if (!res.success) return `grep: ${target}: ${res.error}\n`;
      content = res.content;
    }
    
    return content.split('\n').filter(line => line.includes(pattern)).join('\n') + '\n';
  }
  
  cmdWc(args, input) {
      let content = '';
      if (input) content = input;
      else {
          const res = this.fs.read(args[args.length-1]);
          if (!res.success) return `wc: ${args[args.length-1]}: ${res.error}\n`;
          content = res.content;
      }
      const lines = content.split('\n').length - 1;
      return ` ${lines} ${input ? '' : args[args.length-1]}\n`;
  }
  
  cmdHead(args, input) {
      let content = input || '';
      if (!input && args[1]) {
          const res = this.fs.read(args[args.length-1]);
          if (res.success) content = res.content;
      }
      return content.split('\n').slice(0, 10).join('\n') + '\n';
  }

  cmdTail(args, input) {
      let content = input || '';
      if (!input && args[1]) {
          const res = this.fs.read(args[args.length-1]);
          if (res.success) content = res.content;
      }
      const lines = content.split('\n');
      return lines.slice(Math.max(lines.length - 10, 0)).join('\n') + '\n';
  }

  // --- New File Ops ---
  cmdCp(args) {
    if (args.length < 3) return `cp: missing file operand\n`;
    const srcRes = this.fs.read(args[1]);
    if (!srcRes.success) return `cp: cannot stat '${args[1]}': ${srcRes.error}\n`;
    const res = this.fs.write(args[2], srcRes.content, false, this.users.getCurrentUser(), this.users.getCurrentUser());
    if (!res.success) return `cp: cannot create regular file '${args[2]}': ${res.error}\n`;
    return '';
  }

  cmdMv(args) {
    if (args.length < 3) return `mv: missing file operand\n`;
    const cpRes = this.cmdCp(args);
    if (cpRes) return cpRes; // Error from cp
    this.fs.rm(args[1]);
    return '';
  }

  cmdFind(args) {
    const startPath = args[1] || '.';
    const resolvedStart = this.fs.resolvePath(startPath);
    const startNode = this.fs.get(resolvedStart);
    if (!startNode || startNode.type !== 'dir') return `find: '${startPath}': No such file or directory\n`;

    let out = '';
    const traverse = (node, path) => {
        out += `${path}\n`;
        if (node.type === 'dir') {
            Object.values(node.children).forEach(child => {
                traverse(child, path === '/' ? `/${child.name}` : `${path}/${child.name}`);
            });
        }
    };
    traverse(startNode, startPath);
    return out;
  }

  cmdTree(args) {
    const startPath = args[1] || '.';
    const resolvedStart = this.fs.resolvePath(startPath);
    const startNode = this.fs.get(resolvedStart);
    if (!startNode || startNode.type !== 'dir') return `${startPath} [error opening dir]\n0 directories, 0 files\n`;

    let out = `${startPath}\n`;
    let dirs = 0; let files = 0;
    
    const traverse = (node, prefix) => {
        const children = Object.values(node.children);
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            out += `${prefix}${isLast ? '└── ' : '├── '}${child.name}\n`;
            if (child.type === 'dir') {
                dirs++;
                traverse(child, prefix + (isLast ? '    ' : '│   '));
            } else {
                files++;
            }
        });
    };
    traverse(startNode, '');
    out += `\n${dirs} directories, ${files} files\n`;
    return out;
  }

  cmdLn(args) {
    if (args.length < 3) return `ln: missing file operand\n`;
    return `ln: failed to create symbolic link '${args[2]}': Function not implemented\n`;
  }

  cmdFile(args) {
    if (!args[1]) return `Usage: file [FILE...]\n`;
    const node = this.fs.get(args[1]);
    if (!node) return `${args[1]}: cannot open (No such file or directory)\n`;
    if (node.type === 'dir') return `${args[1]}: directory\n`;
    if (node.content && node.content.startsWith('\x7fELF')) return `${args[1]}: ELF 64-bit LSB executable, x86-64\n`;
    return `${args[1]}: ASCII text\n`;
  }

  // --- Text Processing ---
  cmdAwk(args, input) {
    if (!input && args.length < 3) return `awk: usage: awk 'program' [file]\n`;
    let text = input || '';
    if (!input) {
      const res = this.fs.read(args[2]);
      if (res.success) text = res.content;
      else return `awk: cannot open ${args[2]} (${res.error})\n`;
    }
    // Very naive awk '{print $1}' mock
    if (args[1] && args[1].includes('print $')) {
        const colIdx = parseInt(args[1].match(/\$(\d+)/)[1]) - 1;
        return text.split('\n').map(line => line.split(/\s+/)[colIdx] || '').join('\n') + '\n';
    }
    return text;
  }

  cmdSed(args, input) {
    let text = input || '';
    if (!input && args.length > 2) {
      const res = this.fs.read(args[args.length-1]);
      if (res.success) text = res.content;
    }
    return text; // Mock pass-through
  }

  cmdSort(args, input) {
    let text = input || '';
    if (!input && args.length > 1) {
      const res = this.fs.read(args[args.length-1]);
      if (res.success) text = res.content;
    }
    return text.split('\n').filter(Boolean).sort().join('\n') + '\n';
  }

  cmdUniq(args, input) {
    let text = input || '';
    if (!input && args.length > 1) {
      const res = this.fs.read(args[args.length-1]);
      if (res.success) text = res.content;
    }
    const lines = text.split('\n');
    return lines.filter((v, i, a) => v !== a[i-1]).join('\n') + '\n';
  }

  cmdDiff(args) { return ``; } // Mock empty output
  cmdCmp(args) { return ``; }

  // --- Archives ---
  cmdTar(args) {
    const isCreate = args[1] && args[1].includes('c');
    const isExtract = args[1] && args[1].includes('x');
    const target = args[2] || 'archive.tar.gz';
    if (isCreate) return `tar: Removing leading '/' from member names\n`;
    if (isExtract) return `tar: extracted files\n`;
    return `tar: option requires an argument\nTry 'tar --help'\n`;
  }

  cmdGzip(args) {
    if (!args[1]) return `gzip: compressed data not written to a terminal.\n`;
    return ``; 
  }

  // --- System Info ---
  cmdTop() { return `top - 08:00:00 up 1 day,  1 user,  load average: 0.05, 0.02, 0.01\nTasks:  85 total,   1 running,  84 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  1.5 us,  0.5 sy,  0.0 ni, 98.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :   1998.0 total,   1024.0 free,    512.0 used,    462.0 buff/cache\nMiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   1234.0 avail Mem \n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n    1 root      20   0  166324  11520   8340 S   0.0   0.6   0:01.23 systemd\n`; }
  cmdFree() { return `               total        used        free      shared  buff/cache   available\nMem:         2045952      524288     1048576       16384      473088     1263616\nSwap:        2097152           0     2097152\n`; }
  
  cmdDf() { return `Filesystem     1K-blocks    Used Available Use% Mounted on\nudev             1022976       0   1022976   0% /dev\ntmpfs             204595    1024    203571   1% /run\n/dev/sda1       20000000 5000000  14000000  26% /\n`; }
  cmdDu(args) { return `4\t${args[1] || '.'}\n`; }
}
