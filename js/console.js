export class CommandConsole {
    constructor({ inputSelector, boardInstance }) {
      this.input = document.querySelector(inputSelector);
      this.board = boardInstance;
      this.input.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.handleCommand(e.target.value.trim());
      });
    }
  
    handleCommand(cmd) {
      // very basic parsing: "add NAME to STATUS"
      const parts = cmd.match(/^add (.+) to (todo|in-progress|done)$/i);
      if (parts) {
        const [, name, status] = parts;
        this.board.addTask(name, status.toLowerCase());
      }
      this.input.value = '';
    }
  }
  