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
        case 'cat': return pipelineInput ? pipelineInput : this.cmdCat(args);
        case 'head': return this.cmdHead(args, pipelineInput);
        case 'tail': return this.cmdTail(args, pipelineInput);
        case 'wc': return this.cmdWc(args, pipelineInput);
        
        // Permissions / Users
        case 'chmod': return this.cmdChmod(args);
        case 'chown': return this.cmdChown(args);
        case 'whoami': return this.users.getCurrentUser() + '\n';
        case 'id': return `uid=${this.users.getUserInfo().uid}(${this.users.getCurrentUser()}) gid=${this.users.getUserInfo().gid} groups=...\n`;
        case 'su': return this.cmdSu(args);
        case 'sudo': return this.cmdSudo(args, terminalContext);
        
        // Grep
        case 'grep': return this.cmdGrep(args, pipelineInput);
        
        // Processes
        case 'ps': return this.cmdPs(args);
        case 'kill': return this.cmdKill(args);
        
        // Utils
        case 'echo': return args.slice(1).join(' ').replace(/["']/g, '') + '\n';
        case 'clear': 
          terminalContext.clearScreen(); 
          return '';
        case 'history': 
          return terminalContext.history.map((h, i) => `  ${i+1}  ${h}`).join('\n') + '\n';
        case 'date': return new Date().toString() + '\n';
        
        // Network (Mocked)
        case 'ping': return `PING ${args[1] || '8.8.8.8'} (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=10.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=9.5 ms\n64 bytes from 8.8.8.8: icmp_seq=3 ttl=115 time=10.1 ms\n64 bytes from 8.8.8.8: icmp_seq=4 ttl=115 time=9.8 ms\n`;
        case 'curl': return args[1] ? `<!DOCTYPE html>\n<html>\n<body>\n<h1>Success</h1>\n<p>Fetched from ${args[1]}</p>\n</body>\n</html>\n` : `curl: try 'curl --help'\n`;
        
        default: return `${cmd}: command not found\n`;
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
}
