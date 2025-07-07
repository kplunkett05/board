export class Timer {
    constructor({ displaySelector, startBtn, resetBtn }) {
      this.display = document.querySelector(displaySelector);
      this.startBtn = document.querySelector(startBtn);
      this.resetBtn = document.querySelector(resetBtn);
      this.duration = 1 * 60;
      this.interval = null;
      this.running = false;
      this.attachEvents();
      this.updateDisplay();
    }
  
    attachEvents() {
      this.startBtn.addEventListener('click', () => this.toggle());
      this.resetBtn.addEventListener('click', () => this.reset());
    }
  
    updateDisplay() {
      const m = Math.floor(this.duration / 60).toString().padStart(2, '0');
      const s = (this.duration % 60).toString().padStart(2, '0');
      this.display.textContent = `${m}:${s}`;
    }
  
    tick() {
      if (this.duration > 0) {
        this.duration--;
        this.updateDisplay();
      } else this.reset();
    }
  
    toggle() {
      if (this.running) {
        clearInterval(this.interval);
        this.startBtn.textContent = 'Start';
      } else {
        this.interval = setInterval(() => this.tick(), 1000);
        this.startBtn.textContent = 'Pause';
      }
      this.running = !this.running;
    }
  
    reset() {
      clearInterval(this.interval);
      this.duration = 25 * 60;
      this.running = false;
      this.startBtn.textContent = 'Start';
      this.updateDisplay();
    }
  }
  