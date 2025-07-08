// Global state management
class KanbanApp {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('kanban-items') || '[]');
        this.stats = JSON.parse(localStorage.getItem('kanban-stats') || '{}');
        this.projectStartDate = localStorage.getItem('kanban-start-date') || new Date().toISOString();
        
        // Initialize stats if empty
        if (!this.stats.totalWorkTime) {
            this.stats = {
                totalWorkTime: 0,
                itemsCompleted: 0,
                longestItem: null,
                currentStreak: 0,
                lastWorkDate: null
            };
        }
        
        // Store project start date
        if (!localStorage.getItem('kanban-start-date')) {
            localStorage.setItem('kanban-start-date', this.projectStartDate);
        }
        
        this.timer = new PomodoroTimer();
        this.console = new ConsoleManager();
        this.stats = new StatsManager();
        
        this.init();
        
        // Initialize drag and drop after DOM is ready
        this.dragDrop = new DragDropManager();
    }
    
    init() {
        this.renderItems();
        this.setupEventListeners();
        this.setupGlobalKeyboardShortcuts();
        
        // Create default items if none exist
        if (this.items.length === 0) {
            this.addItem('todo', 'new item');
            this.addItem('in-prog', 'new item');
            this.addItem('completed', 'new item');
        }
    }
    
    setupEventListeners() {
        // Stats button
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.stats.showStats();
        });
        
        // Close stats modal
        document.getElementById('close-stats').addEventListener('click', () => {
            this.stats.hideStats();
        });
        
        // Click outside stats modal to close
        document.getElementById('stats-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('stats-modal')) {
                this.stats.hideStats();
            }
        });
    }
    
    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if user is currently editing text
            const isEditing = document.activeElement.tagName === 'INPUT' || 
                             document.activeElement.tagName === 'TEXTAREA' ||
                             document.activeElement.contentEditable === 'true';
            
            if (e.key === '/' && !isEditing) {
                e.preventDefault();
                this.console.focusInput();
            }
        });
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    addItem(column, name = 'new item', description = '') {
        const item = {
            id: this.generateId(),
            name,
            description,
            column,
            timeSpent: 0,
            createdAt: new Date().toISOString()
        };
        
        this.items.push(item);
        this.saveItems();
        this.renderItems();
        return item;
    }
    
    removeItem(column, name) {
        const index = this.items.findIndex(item => 
            item.column === column && item.name.toLowerCase() === name.toLowerCase()
        );
        
        if (index !== -1) {
            this.items.splice(index, 1);
            this.saveItems();
            this.renderItems();
            return true;
        }
        return false;
    }
    
    moveItem(fromColumn, name, toColumn) {
        const item = this.items.find(item => 
            item.column === fromColumn && item.name.toLowerCase() === name.toLowerCase()
        );
        
        if (item) {
            item.column = toColumn;
            this.saveItems();
            this.renderItems();
            return true;
        }
        return false;
    }
    
    renameItem(column, oldName, newName) {
        const item = this.items.find(item => 
            item.column === column && item.name.toLowerCase() === oldName.toLowerCase()
        );
        
        if (item) {
            item.name = newName;
            this.saveItems();
            this.renderItems();
            return true;
        }
        return false;
    }
    
    updateItemDescription(column, name, description) {
        const item = this.items.find(item => 
            item.column === column && item.name.toLowerCase() === name.toLowerCase()
        );
        
        if (item) {
            item.description = description;
            this.saveItems();
            this.renderItems();
            return true;
        }
        return false;
    }
    
    updateItemTime(itemId, timeIncrement) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.timeSpent += timeIncrement;
            this.saveItems();
        }
    }
    
    getItemsByColumn(column) {
        return this.items.filter(item => item.column === column);
    }
    
    renderItems() {
        const columns = ['todo', 'in-prog', 'completed'];
        
        columns.forEach(column => {
            const container = document.getElementById(`${column}-items`);
            const items = this.getItemsByColumn(column);
            
            container.innerHTML = '';
            items.forEach(item => {
                const itemElement = this.createItemElement(item);
                container.appendChild(itemElement);
            });
        });
    }
    
    createItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        // Remove draggable from the main item div
        itemDiv.dataset.itemId = item.id;
        
        // Create grab bar above the name
        const grabBar = document.createElement('div');
        grabBar.className = 'item-grab-bar';
        grabBar.draggable = true;
        grabBar.dataset.itemId = item.id;
        
        // Create item header with name and delete button
        const itemHeader = document.createElement('div');
        itemHeader.className = 'item-header';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-name';
        nameDiv.textContent = item.name;
        nameDiv.contentEditable = true;
        
        // Name editing
        nameDiv.addEventListener('blur', () => {
            const newName = nameDiv.textContent.trim();
            if (newName && newName !== item.name) {
                item.name = newName;
                this.saveItems();
            }
            nameDiv.classList.remove('editing');
        });
        
        nameDiv.addEventListener('focus', () => {
            nameDiv.classList.add('editing');
        });
        
        nameDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameDiv.blur();
            }
        });
        
        itemHeader.appendChild(nameDiv);
        
        // Add grab bar first, then header
        itemDiv.appendChild(grabBar);
        itemDiv.appendChild(itemHeader);
        
        // Show time if item has time spent
        if (item.timeSpent > 0) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'item-time';
            timeDiv.textContent = this.formatTime(item.timeSpent);
            itemDiv.appendChild(timeDiv);
        }
        
        // Create description preview (truncated view)
        const descPreview = document.createElement('div');
        descPreview.className = 'item-description-preview';
        
        const updateDescriptionPreview = (description) => {
            if (description) {
                descPreview.textContent = description;
                descPreview.classList.remove('empty');
                
                // Use a setTimeout to ensure the element is rendered before checking overflow
                setTimeout(() => {
                    // Check if text is being clamped by webkit-line-clamp
                    // Create a temporary element to measure the full text height
                    const tempElement = document.createElement('div');
                    tempElement.style.cssText = `
                        position: absolute;
                        visibility: hidden;
                        width: ${descPreview.offsetWidth}px;
                        font-size: 0.9em;
                        line-height: 1.4;
                        padding: 8px;
                        word-wrap: break-word;
                        word-break: break-word;
                        font-family: inherit;
                    `;
                    tempElement.textContent = description;
                    document.body.appendChild(tempElement);
                    
                    const fullHeight = tempElement.offsetHeight;
                    const clampedHeight = descPreview.offsetHeight;
                    
                    if (fullHeight > clampedHeight) {
                        descPreview.classList.add('has-overflow');
                    } else {
                        descPreview.classList.remove('has-overflow');
                    }
                    
                    document.body.removeChild(tempElement);
                }, 0);
            } else {
                descPreview.textContent = 'Click to add description...';
                descPreview.classList.add('empty');
                descPreview.classList.remove('has-overflow');
            }
        };
        
        updateDescriptionPreview(item.description);
        
        // Description expand/collapse functionality
        let isExpanded = false;
        let descTextarea = null;
        
        const expandDescription = () => {
            if (isExpanded) return;
            
            isExpanded = true;
            
            // Create textarea for editing
            descTextarea = document.createElement('textarea');
            descTextarea.className = 'item-description-expanded';
            descTextarea.value = item.description || '';
            descTextarea.placeholder = 'Add description...';
            
            // Replace preview with textarea
            itemDiv.replaceChild(descTextarea, descPreview);
            descTextarea.focus();
            
            // Handle save/cancel
            const saveDescription = () => {
                const newDescription = descTextarea.value.trim();
                if (newDescription !== item.description) {
                    item.description = newDescription;
                    this.saveItems();
                    
                    // Update preview text with overflow detection
                    updateDescriptionPreview(newDescription);
                }
                collapseDescription();
            };
            
            const cancelDescription = () => {
                collapseDescription();
            };
            
            descTextarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveDescription();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelDescription();
                }
            });
            
            descTextarea.addEventListener('blur', saveDescription);
        };
        
        const collapseDescription = () => {
            if (!isExpanded) return;
            
            isExpanded = false;
            
            // Replace textarea with preview
            itemDiv.replaceChild(descPreview, descTextarea);
            descTextarea = null;
        };
        
        // Click on description to expand
        descPreview.addEventListener('click', (e) => {
            e.stopPropagation();
            expandDescription();
        });
        
        // Click outside to collapse (handled by document listener)
        document.addEventListener('click', (e) => {
            if (isExpanded && !itemDiv.contains(e.target)) {
                if (descTextarea) {
                    const newDescription = descTextarea.value.trim();
                    if (newDescription !== item.description) {
                        item.description = newDescription;
                        this.saveItems();
                        
                        // Update preview text with overflow detection
                        updateDescriptionPreview(newDescription);
                    }
                }
                collapseDescription();
            }
        });
        
        itemDiv.appendChild(descPreview);
        
        // Add drag event listeners to the grab bar instead of the item
        grabBar.addEventListener('dragstart', (e) => {
            // Don't allow dragging when editing name or description
            if (nameDiv.classList.contains('editing') || descPreview.classList.contains('editing')) {
                e.preventDefault();
                return;
            }
            console.log('Drag started for item:', item.name);
            // Pass the item div to handleDragStart, not the grab bar
            this.dragDrop.handleDragStart(e, itemDiv);
        });
        
        grabBar.addEventListener('dragend', (e) => {
            console.log('Drag ended for item:', item.name);
            this.dragDrop.handleDragEnd(e, itemDiv);
        });
        
        // Add hover effects for grab bar
        grabBar.addEventListener('mouseenter', () => {
            itemDiv.classList.add('grab-bar-hover');
        });
        
        grabBar.addEventListener('mouseleave', () => {
            itemDiv.classList.remove('grab-bar-hover');
        });
        
        return itemDiv;
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    saveItems() {
        localStorage.setItem('kanban-items', JSON.stringify(this.items));
    }
}

// Pomodoro Timer Manager
class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.isWorkSession = true;
        this.workSessionsCompleted = 0;
        this.interval = null;
        this.totalTime = 25 * 60;
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pause();
        });
        
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.skip();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }
    
    pause() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    
    skip() {
        this.pause();
        this.nextSession();
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
    }
    
    tick() {
        this.timeLeft--;
        this.updateDisplay();
        
        // Update time for in-progress items during work sessions
        if (this.isWorkSession) {
            this.updateInProgressItemsTime();
        }
        
        if (this.timeLeft <= 0) {
            this.sessionComplete();
        }
    }
    
    updateInProgressItemsTime() {
        const inProgressItems = kanbanApp.getItemsByColumn('in-prog');
        inProgressItems.forEach(item => {
            kanbanApp.updateItemTime(item.id, 1);
        });
    }
    
    sessionComplete() {
        this.pause();
        
        if (this.isWorkSession) {
            this.workSessionsCompleted++;
            // Update total work time stat
            const stats = JSON.parse(localStorage.getItem('kanban-stats') || '{}');
            stats.totalWorkTime = (stats.totalWorkTime || 0) + (this.totalTime);
            localStorage.setItem('kanban-stats', JSON.stringify(stats));
        }
        
        this.nextSession();
        
        // Play notification sound or show notification
        this.notify();
    }
    
    nextSession() {
        if (this.isWorkSession) {
            // Work session complete, start break
            if (this.workSessionsCompleted % 4 === 0) {
                // Long break after 4 work sessions
                this.timeLeft = 30 * 60; // 30 minutes
                this.totalTime = 30 * 60;
            } else {
                // Short break
                this.timeLeft = 5 * 60; // 5 minutes
                this.totalTime = 5 * 60;
            }
            this.isWorkSession = false;
        } else {
            // Break complete, start work
            this.timeLeft = 25 * 60; // 25 minutes
            this.totalTime = 25 * 60;
            this.isWorkSession = true;
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.querySelector('.timer-text').textContent = timeString;
        
        // Update progress ring
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const circumference = 2 * Math.PI * 25; // radius = 25
        const strokeDashoffset = circumference - (progress * circumference);
        
        document.querySelector('.progress-ring-progress').style.strokeDashoffset = strokeDashoffset;
        
        // Change color based on session type
        const progressRing = document.querySelector('.progress-ring-progress');
        if (this.isWorkSession) {
            progressRing.style.stroke = '#ff6b6b';
        } else {
            progressRing.style.stroke = '#00b894';
        }
    }
    
    notify() {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #74b9ff;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            font-weight: bold;
        `;
        
        notification.textContent = this.isWorkSession ? 
            'Work session complete! Time for a break.' : 
            'Break time over! Ready to work?';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

// Console Manager
class ConsoleManager {
    constructor() {
        this.commands = {
            'help': this.showHelp.bind(this),
            'a': this.addItem.bind(this),
            'rm': this.removeItem.bind(this),
            'mv': this.moveItem.bind(this),
            'rename': this.renameItem.bind(this),
            'desc': this.updateDescription.bind(this),
            'start': this.startTimer.bind(this),
            'pause': this.pauseTimer.bind(this),
            'skip': this.skipTimer.bind(this),
            'reset': this.resetTimer.bind(this),
            'fullreset': this.fullReset.bind(this)
        };
        
        this.commandSuggestions = Object.keys(this.commands);
        this.columns = ['todo', 'in-prog', 'completed'];
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const input = document.getElementById('console-input');
        const suggestions = document.getElementById('console-suggestions');
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(input.value);
                input.value = '';
                this.hideSuggestions();
            } else if (e.key === 'Escape') {
                input.blur();
                this.hideSuggestions();
            } else if (e.key === 'Tab') {
                // Accept the current suggestion
                const suggestionElement = suggestions.querySelector('.suggestion-item');
                if (suggestionElement) {
                    e.preventDefault();
                    input.value = suggestionElement.textContent;
                    this.hideSuggestions();
                }
            }
        });
        
        input.addEventListener('input', (e) => {
            this.updateSuggestions(e.target.value);
        });
        
        input.addEventListener('blur', () => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => {
                this.hideSuggestions();
            }, 200);
        });
        
        // Handle suggestion clicks
        suggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.textContent;
                input.focus();
                this.hideSuggestions();
            }
        });
    }
    
    updateSuggestions(input) {
        const suggestions = document.getElementById('console-suggestions');
        
        if (!input.trim()) {
            this.hideSuggestions();
            return;
        }
        
        const args = input.trim().split(/\s+/);
        const command = args[0].toLowerCase();
        let matches = [];
        
        // Commands that take column names as first parameter
        const columnCommands = ['a', 'rm', 'mv', 'rename', 'desc'];
        // Commands that work with existing items (need item name suggestions)
        const itemCommands = ['rm', 'mv', 'rename', 'desc'];
        
        if (args.length === 1) {
            // Suggesting commands
            matches = this.commandSuggestions.filter(cmd => 
                cmd.toLowerCase().startsWith(command)
            );
        } else if (args.length === 2 && columnCommands.includes(command)) {
            // Suggesting column names for commands that take columns as first parameter
            const columnInput = args[1].toLowerCase();
            matches = this.columns.filter(col => 
                col.toLowerCase().startsWith(columnInput)
            );
        } else if (args.length >= 3 && itemCommands.includes(command)) {
            // Suggesting item names for commands that work with existing items
            const columnName = args[1];
            const itemInput = args.slice(2).join(' ').toLowerCase();
            
            if (this.columns.includes(columnName)) {
                // Get items from the specified column
                const columnItems = kanbanApp.getItemsByColumn(columnName);
                matches = columnItems
                    .filter(item => item.name.toLowerCase().startsWith(itemInput))
                    .map(item => item.name);
            }
        }
        
        if (matches.length > 0) {
            // Only show the first match to prevent scrolling
            const suggestion = matches[0];
            let suggestionText = '';
            
            if (args.length === 1) {
                // Command suggestion
                suggestionText = suggestion;
            } else if (args.length === 2 && columnCommands.includes(command)) {
                // Column suggestion - show full command with suggested column
                suggestionText = `${command} ${suggestion}`;
            } else if (args.length >= 3 && itemCommands.includes(command)) {
                // Item suggestion - show full command with suggested item
                suggestionText = `${command} ${args[1]} ${suggestion}`;
            }
            
            suggestions.innerHTML = `<div class="suggestion-item">${suggestionText}</div>`;
            suggestions.classList.add('visible');
        } else {
            this.hideSuggestions();
        }
    }
    
    hideSuggestions() {
        document.getElementById('console-suggestions').classList.remove('visible');
    }
    
    focusInput() {
        const input = document.getElementById('console-input');
        input.focus();
        // Don't add the slash character - let it be empty for clean input
    }
    
    executeCommand(commandLine) {
        const args = commandLine.trim().split(/\s+/);
        const command = args[0].toLowerCase();
        
        this.logCommand(commandLine);
        
        if (this.commands[command]) {
            try {
                this.commands[command](args.slice(1));
            } catch (error) {
                this.logError(`Error executing command: ${error.message}`);
            }
        } else {
            this.logError(`Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }
    
    logCommand(command) {
        this.log(`> ${command}`, 'info');
    }
    
    logError(message) {
        this.log(message, 'error');
    }
    
    logSuccess(message) {
        this.log(message, 'success');
    }
    
    log(message, type = '') {
        const output = document.getElementById('console-output');
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = message;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }
    
    // Command implementations
    showHelp() {
        const helpText = [
            'Available commands:',
            '  a [column] [name] - Add new item',
            '  rm [column] [name] - Remove item',
            '  mv [column] [name] [new_column] - Move item',
            '  rename [column] [name] [new_name] - Rename item',
            '  desc [column] [name] [description] - Update description',
            '  start - Start pomodoro timer',
            '  pause - Pause timer',
            '  skip - Skip current timer session',
            '  reset - Reset timer',
            '  fullreset - Completely reset board to default',
            '  help - Show this help',
            '',
            'Columns: todo, in-prog, completed'
        ];
        
        helpText.forEach(line => this.log(line));
    }
    
    addItem(args) {
        if (args.length < 2) {
            this.logError('Usage: a [column] [name]');
            return;
        }
        
        const column = args[0];
        const name = args.slice(1).join(' ');
        
        if (!this.columns.includes(column)) {
            this.logError(`Invalid column: ${column}. Use: ${this.columns.join(', ')}`);
            return;
        }
        
        kanbanApp.addItem(column, name);
        this.logSuccess(`Added '${name}' to ${column}`);
    }
    
    removeItem(args) {
        if (args.length < 2) {
            this.logError('Usage: rm [column] [name]');
            return;
        }
        
        const column = args[0];
        const name = args.slice(1).join(' ');
        
        if (kanbanApp.removeItem(column, name)) {
            this.logSuccess(`Removed '${name}' from ${column}`);
        } else {
            this.logError(`Item '${name}' not found in ${column}`);
        }
    }
    
    moveItem(args) {
        if (args.length < 3) {
            this.logError('Usage: mv [column] [name] [new_column]');
            return;
        }
        
        const fromColumn = args[0];
        const toColumn = args[args.length - 1];
        const name = args.slice(1, -1).join(' ');
        
        if (kanbanApp.moveItem(fromColumn, name, toColumn)) {
            this.logSuccess(`Moved '${name}' from ${fromColumn} to ${toColumn}`);
        } else {
            this.logError(`Item '${name}' not found in ${fromColumn}`);
        }
    }
    
    renameItem(args) {
        if (args.length < 3) {
            this.logError('Usage: rename [column] [old_name] [new_name]');
            return;
        }
        
        const column = args[0];
        const oldName = args[1];
        const newName = args.slice(2).join(' ');
        
        if (kanbanApp.renameItem(column, oldName, newName)) {
            this.logSuccess(`Renamed '${oldName}' to '${newName}' in ${column}`);
        } else {
            this.logError(`Item '${oldName}' not found in ${column}`);
        }
    }
    
    updateDescription(args) {
        if (args.length < 3) {
            this.logError('Usage: desc [column] [name] [description]');
            return;
        }
        
        const column = args[0];
        const name = args[1];
        const description = args.slice(2).join(' ');
        
        if (kanbanApp.updateItemDescription(column, name, description)) {
            this.logSuccess(`Updated description for '${name}' in ${column}`);
        } else {
            this.logError(`Item '${name}' not found in ${column}`);
        }
    }
    
    startTimer() {
        kanbanApp.timer.start();
        this.logSuccess('Timer started');
    }
    
    pauseTimer() {
        kanbanApp.timer.pause();
        this.logSuccess('Timer paused');
    }
    
    skipTimer() {
        kanbanApp.timer.skip();
        this.logSuccess('Timer skipped');
    }
    
    resetTimer() {
        kanbanApp.timer.reset();
        this.logSuccess('Timer reset');
    }
    
    fullReset() {
        // Confirm with user before resetting
        if (confirm('Are you sure you want to completely reset the board? This will delete all items, stats, and time tracking data. This cannot be undone.')) {
            // Clear all localStorage data
            localStorage.removeItem('kanban-items');
            localStorage.removeItem('kanban-stats');
            localStorage.removeItem('kanban-start-date');
            
            // Reset app state
            kanbanApp.items = [];
            kanbanApp.stats = {
                totalWorkTime: 0,
                itemsCompleted: 0,
                longestItem: null,
                currentStreak: 0,
                lastWorkDate: null
            };
            kanbanApp.projectStartDate = new Date().toISOString();
            localStorage.setItem('kanban-start-date', kanbanApp.projectStartDate);
            
            // Reset timer
            kanbanApp.timer.pause();
            kanbanApp.timer.timeLeft = 25 * 60;
            kanbanApp.timer.totalTime = 25 * 60;
            kanbanApp.timer.isWorkSession = true;
            kanbanApp.timer.workSessionsCompleted = 0;
            kanbanApp.timer.updateDisplay();
            
            // Clear console output
            const consoleOutput = document.getElementById('console-output');
            consoleOutput.innerHTML = '<div class="console-line">Press / to focus here. Type help to get help.</div>';
            
            // Create default items
            kanbanApp.addItem('todo', 'new item');
            kanbanApp.addItem('in-prog', 'new item');
            kanbanApp.addItem('completed', 'new item');
            
            this.logSuccess('Board completely reset to default state');
        } else {
            this.log('Full reset cancelled');
        }
    }
}

// Stats Manager
class StatsManager {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('kanban-stats') || '{}');
        this.projectStartDate = localStorage.getItem('kanban-start-date') || new Date().toISOString();
    }
    
    showStats() {
        this.updateStats();
        document.getElementById('stats-modal').classList.add('visible');
    }
    
    hideStats() {
        document.getElementById('stats-modal').classList.remove('visible');
    }
    
    updateStats() {
        const stats = JSON.parse(localStorage.getItem('kanban-stats') || '{}');
        const items = JSON.parse(localStorage.getItem('kanban-items') || '[]');
        
        // Calculate stats
        const completedItems = items.filter(item => item.column === 'completed');
        const longestItem = items.reduce((longest, item) => 
            item.timeSpent > (longest?.timeSpent || 0) ? item : longest, null);
        
        const projectDuration = Math.floor(
            (new Date() - new Date(this.projectStartDate)) / (1000 * 60 * 60 * 24)
        );
        
        // Update display
        document.getElementById('total-work-time').textContent = 
            this.formatTime(stats.totalWorkTime || 0);
        document.getElementById('longest-item').textContent = 
            longestItem ? `${longestItem.name} (${this.formatTime(longestItem.timeSpent)})` : 'None';
        document.getElementById('project-duration').textContent = 
            `${projectDuration} days`;
        document.getElementById('items-completed').textContent = 
            completedItems.length.toString();
        document.getElementById('current-streak').textContent = 
            this.calculateStreak().toString() + ' days';
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    calculateStreak() {
        // Simple streak calculation - days since project start
        const startDate = new Date(this.projectStartDate);
        const today = new Date();
        return Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    }
}

// Drag and Drop Manager
class DragDropManager {
    constructor() {
        this.draggedItem = null;
        this.setupColumnEventListeners();
    }
    
    setupColumnEventListeners() {
        // Set up drag and drop for columns
        const columns = document.querySelectorAll('.column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.classList.add('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log('Drop event triggered on column:', column.id);
                this.handleDrop(e, column);
            });
            
            column.addEventListener('dragenter', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                // Only remove highlight if we're actually leaving the column
                if (!column.contains(e.relatedTarget)) {
                    column.classList.remove('drag-over');
                }
            });
        });
    }
    
    handleDragStart(e, itemElement) {
        console.log('handleDragStart called');
        this.draggedItem = itemElement || e.target.closest('.item');
        this.draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.itemId);
        
        // Use a much simpler approach - just offset the drag image slightly
        // This prevents the layout issues without complex drag image manipulation
        const rect = this.draggedItem.getBoundingClientRect();
        e.dataTransfer.setDragImage(this.draggedItem, rect.width / 2, 20);
    }
    
    handleDragEnd(e, itemElement) {
        console.log('handleDragEnd called');
        const draggedItem = itemElement || e.target.closest('.item');
        draggedItem.classList.remove('dragging');
        this.draggedItem = null;
        
        // Remove drag-over class from all columns
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }
    
    handleDrop(e, targetColumn) {
        console.log('handleDrop called with target:', targetColumn.id);
        
        if (this.draggedItem) {
            const targetColumnName = targetColumn.id.replace('-column', '');
            const itemId = this.draggedItem.dataset.itemId;
            
            console.log('Moving item', itemId, 'to column', targetColumnName);
            
            // Find the item in the data
            const item = kanbanApp.items.find(item => item.id === itemId);
            if (item && item.column !== targetColumnName) {
                console.log('Item found, updating column from', item.column, 'to', targetColumnName);
                item.column = targetColumnName;
                kanbanApp.saveItems();
                kanbanApp.renderItems();
            }
        }
        
        // Remove drag-over class from all columns
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }
}

// Initialize the app
let kanbanApp;
document.addEventListener('DOMContentLoaded', () => {
    kanbanApp = new KanbanApp();
}); 