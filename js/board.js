export class Board {
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      this.initDragAndDrop();
      this.initAddButtons();
    }
  
    initAddButtons() {
      this.container.querySelectorAll('.add-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const col = btn.closest('.column').dataset.status;
          const name = prompt(`New task for ${col}:`);
          if (name) this.addTask(name, col);
        });
      });
    }
  
    addTask(text, status) {
      const list = this.container.querySelector(`.column[data-status="${status}"] .task-list`);
      const li = document.createElement('li');
      li.textContent = text;
      li.draggable = true;
      list.appendChild(li);
    }
  
    initDragAndDrop() {
      let dragged = null;
      this.container.querySelectorAll('.task-list li').forEach(item => {
        item.addEventListener('dragstart', () => dragged = item);
      });
      this.container.querySelectorAll('.task-list').forEach(list => {
        list.addEventListener('dragover', e => e.preventDefault());
        list.addEventListener('drop', () => {
          if (dragged) list.appendChild(dragged);
        });
      });
    }
  }
  