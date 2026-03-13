import { FileSystem } from './FileSystem.js';
import { UserManager } from './UserManager.js';
import { ProcessManager } from './ProcessManager.js';
import { CommandExecutor } from './CommandExecutor.js';

export class Terminal {
  constructor(containerElement, onCommandExecuted = null) {
    this.container = containerElement;
    this.onCommandExecuted = onCommandExecuted;
    
    this.fs = new FileSystem();
    this.users = new UserManager();
    this.procs = new ProcessManager(this.users);
    this.executor = new CommandExecutor(this.fs, this.users, this.procs);
    
    this.history = [];
    this.historyIndex = -1;
    
    this.initUI();
  }

  getPrompt() {
    const user = this.users.getCurrentUser();
    let path = this.fs.pwd;
    const home = this.users.getUserInfo(user).home;
    
    if (path.startsWith(home)) {
      path = '~' + path.substring(home.length);
    }
    
    const symbol = user === 'root' ? '#' : '$';
    return `<span style="color:var(--success)">${user}@linuxlab</span>:<span style="color:var(--info)">${path}</span>${symbol} `;
  }

  initUI() {
    this.container.innerHTML = `
      <div class="terminal-output" style="margin-bottom: 0.5rem"></div>
      <div class="terminal-input-line" style="display:flex;">
        <span class="terminal-prompt" style="white-space:pre-wrap;">${this.getPrompt()}</span>
        <input type="text" class="terminal-input" autofocus autocomplete="off" spellcheck="false" style="flex:1; background:transparent; border:none; color:inherit; font-family:inherit; font-size:inherit; outline:none; padding-left:0.5rem">
      </div>
    `;

    this.outputElement = this.container.querySelector('.terminal-output');
    this.inputElement = this.container.querySelector('.terminal-input');
    this.promptElement = this.container.querySelector('.terminal-prompt');

    this.inputElement.addEventListener('keydown', this.handleInput.bind(this));
    
    // Focus input on container click
    this.container.parentElement.addEventListener('click', () => {
      this.inputElement.focus();
    });
  }

  handleInput(e) {
    if (e.key === 'Enter') {
      const cmd = this.inputElement.value;
      if (cmd.trim()) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
      }
      
      this.inputElement.value = '';
      this.execute(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputElement.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.inputElement.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.inputElement.value = '';
      }
    }
  }

  clearScreen() {
    this.outputElement.innerHTML = '';
  }

  print(text, isHtml = false) {
    const line = document.createElement('div');
    if (isHtml) {
      line.innerHTML = text;
    } else {
      line.textContent = text;
      line.style.whiteSpace = 'pre-wrap';
    }
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }

  execute(cmdLine) {
    // Print the command that was just entered
    this.print(`${this.getPrompt()}${cmdLine}`, true);
    
    // Execute logic
    const output = this.executor.execute(cmdLine, this);
    
    if (output) {
      this.print(output);
    }

    // Update prompt text (directory or user might have changed)
    this.promptElement.innerHTML = this.getPrompt();
    this.scrollToBottom();
    
    if (this.onCommandExecuted) {
      this.onCommandExecuted({
         cmd: cmdLine,
         fs: this.fs,
         history: this.history
      });
    }
  }

  scrollToBottom() {
    const parent = this.container.parentElement;
    if (parent) {
      parent.scrollTop = parent.scrollHeight;
    }
  }
}
