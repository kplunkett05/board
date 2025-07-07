import { Board } from './board.js';
import { Timer } from './timer.js';
import { CommandConsole } from './console.js';

document.addEventListener('DOMContentLoaded', () => {
  const board = new Board('#board');
  const timer = new Timer({
    displaySelector: '#timer-display',
    startBtn: '#start-pause',
    resetBtn: '#reset'
  });
  const consoleUI = new CommandConsole({
    inputSelector: '#cmd-input',
    boardInstance: board
  });
});
