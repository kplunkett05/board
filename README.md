# Productivity Kanban Board 🎯

A modern, bubbly kanban board website designed to boost productivity with integrated pomodoro timer, command console, and time tracking features.

## ✨ Features

### 📋 Kanban Board
- **Three columns**: Todo, In Progress, Completed
- **Drag & Drop**: Move items between columns seamlessly
- **Inline Editing**: Click on item names or descriptions to edit them directly
- **Smart Descriptions**: Gray text that becomes black when editing
- **Direct Editing**: No popup boxes - edit descriptions right in place
- **4-Line Limit**: Descriptions show up to 4 lines, with scrolling when editing
- **Console Commands**: Use command line for advanced operations like deleting
- **Time Tracking**: View time spent on each item
- **Scrollable**: Handles unlimited items with smooth scrolling

### 🍅 Pomodoro Timer
- **Work/Break Cycles**: 25 minutes work, 5 minutes break
- **Long Breaks**: 30-minute break after every 4 work sessions
- **Progress Ring**: Visual indicator of current session progress
- **Timer Controls**: Start, pause, skip, and reset functionality
- **Automatic Time Tracking**: Items in "In Progress" are tracked during work sessions

### 💻 Command Console
- **Keyboard Shortcut**: Press `/` anywhere to start typing commands
- **Smart Suggestions**: Auto-complete commands, column names, and existing item names
- **Tab Completion**: Press Tab to accept suggestions
- **Scrollable History**: Keep track of all executed commands
- **Rich Commands**: Full CRUD operations for items

### 📊 Statistics Panel
- **Total Work Time**: Track your productive hours
- **Longest Item**: See which task took the most time
- **Project Duration**: Days since you started using the board
- **Items Completed**: Count of finished tasks
- **Current Streak**: Consecutive days of activity

## 🎮 How to Use

### Basic Operations
1. **Add Items**: Items start with "new item" as default name
2. **Edit Names**: Click on any item name to edit it inline
3. **Edit Descriptions**: Click on the description area - text becomes black and editable
4. **View Descriptions**: Descriptions show in gray text, limited to 4 lines max
5. **Add Descriptions**: Empty descriptions show "Click to add description..." in italic
6. **Delete Items**: Use console commands (`rm [column] [item name]`)
7. **Move Items**: Drag items between columns or use console commands
8. **Time Tracking**: Items in "In Progress" automatically track time during work sessions

### Keyboard Shortcuts
- Press `/` anywhere (when not editing) to access the console
- Press `Enter` in console to execute commands
- Press `Tab` to accept the current suggestion
- Press `Escape` to exit console input

### Item Interaction
- **Click item name**: Edit the item name inline
- **Click description area**: Edit the description directly inline (text becomes black)
- **Long descriptions**: Scroll within the 4-line limit when editing
- **Drag item**: Move item between columns (disabled while editing)
- **Enter** (in name/description): Save changes and exit editing mode
- **Escape** (in name/description): Cancel changes and exit editing mode
- **Click outside**: Save changes and exit editing mode

### Console Commands
```
a [column] [name]              - Add new item
rm [column] [name]             - Remove item
mv [column] [name] [new_column] - Move item between columns
rename [column] [name] [new_name] - Rename item
desc [column] [name] [description] - Update item description
start                          - Start pomodoro timer
pause                          - Pause timer
skip                           - Skip current timer session
reset                          - Reset timer
fullreset                      - Completely reset board to default
help                           - Show all commands
```

### Column Names
- `todo` - Todo column
- `in-prog` - In Progress column  
- `completed` - Completed column

### Smart Suggestions
The console provides intelligent suggestions as you type:
- **Command Suggestions**: Type `r` to see `rename`, `reset`, etc.
- **Column Name Suggestions**: Type `a to` to see `a todo` suggested
- **Item Name Suggestions**: Type `rm todo h` to see existing items starting with "h"
- **Context Aware**: Knows what type of suggestion you need based on the command
- **Single Suggestion**: Only shows the first match to avoid clutter
- **Tab Completion**: Press Tab to accept any suggestion

### Timer Usage
1. Click the **Start** button (▶️) to begin a work session
2. Work for 25 minutes while the timer runs
3. Items in "In Progress" will automatically track time
4. Take breaks when the timer completes a work session
5. View your **Stats** to see productivity metrics

## 🎨 Design Features

- **Animated Gradient Background**: Smooth color transitions
- **Glassmorphism Effects**: Modern transparent design elements
- **Responsive Layout**: Works on desktop and mobile
- **Hover Animations**: Interactive feedback on all elements
- **Color-Coded Columns**: Easy visual organization
- **Smooth Transitions**: Polished user experience

## 💾 Data Persistence

All data is automatically saved to your browser's local storage:
- Items and their details
- Time tracking information
- Statistics and project start date
- No account required - works offline

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Start adding items to your Todo column
3. Move items to "In Progress" when you begin working
4. Start the pomodoro timer to track your work time
5. Use the console commands for quick operations
6. Check your stats to monitor productivity

**⚠️ Need a Fresh Start?** Use the `fullreset` command to completely reset the board, clearing all items, stats, and time tracking data.

## 🔧 Browser Compatibility

Works in all modern browsers that support:
- ES6 Classes
- Local Storage
- CSS Grid and Flexbox
- HTML5 Drag and Drop API

---

**Pro Tip**: Use the `/` shortcut to quickly access the console, then type your commands: 
Press `/` then type `a todo "Review project requirements"`

**Delete Items**: Since items no longer have delete buttons, use the console: `/rm todo "item name"`

**Smart Suggestions Example**: If you have an item called "hello world" in your todo list, typing `rm todo h` will suggest `rm todo hello world`

**Description Interaction**: Each item shows a description in gray text (limited to 4 lines). Click directly on this text to edit it inline - text becomes black and scrollable if longer than 4 lines. No popup boxes needed - just click, type, and press Enter to save.

Happy productivity! 🎉 