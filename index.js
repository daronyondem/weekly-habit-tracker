// Data structure
let habitData = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
};

// Current active day
let activeDay = 'Monday';

// Function to save data to local storage
function saveData() {
    localStorage.setItem('habitData', JSON.stringify(habitData));
}

// Function to load data from local storage
function loadData() {
    const savedData = localStorage.getItem('habitData');
    if (savedData) {
        habitData = JSON.parse(savedData);
    }
}

// Function to render todo lists for the active day
function renderTodoLists() {
    const content = document.querySelector('.content');
    content.innerHTML = '';

    habitData[activeDay].forEach((list, listIndex) => {
        const listElement = document.createElement('div');
        listElement.className = 'todo-list';
        listElement.innerHTML = `
            <h2>${list.title}</h2>
            ${list.items.map((item, itemIndex) => `
                <div class="todo-item ${item.done ? 'done' : ''}" data-list-index="${listIndex}" data-item-index="${itemIndex}">
                    <div class="todo-item-content">
                        <input type="checkbox" ${item.done ? 'checked' : ''}>
                        <span class="emoji">${item.emoji}</span>
                        <span>${item.title}</span>
                    </div>
                    <div class="swipe-actions">
                        <div class="swipe-action edit-action">Edit</div>
                        <div class="swipe-action delete-action">Delete</div>
                    </div>
                </div>
            `).join('')}
            <button class="add-item" onclick="addItem(${listIndex})">+ Add Item</button>
        `;
        content.appendChild(listElement);
    });

    if (habitData[activeDay].length < 5) {
        const addListButton = document.createElement('button');
        addListButton.id = 'add-list-button';
        addListButton.textContent = '+ Add List';
        addListButton.onclick = addList;
        content.appendChild(addListButton);
    }

    // Add event listeners for swipe actions
    addSwipeListeners();
}

// Function to add swipe listeners
function addSwipeListeners() {
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
        let startX, moveX;
        const content = item.querySelector('.todo-item-content');
        const swipeThreshold = 50; // minimum distance to be considered a swipe

        item.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });

        item.addEventListener('touchmove', e => {
            moveX = e.touches[0].clientX;
            const diff = startX - moveX;
            
            if (diff > 0) { // Swiping left
                e.preventDefault();
                content.style.transform = `translateX(-${Math.min(diff, 120)}px)`;
            }
        });

        item.addEventListener('touchend', e => {
            const diff = startX - moveX;
            
            if (diff > swipeThreshold) {
                content.style.transform = 'translateX(-120px)'; // Fully reveal buttons
            } else {
                content.style.transform = 'translateX(0)'; // Reset position
            }
        });

        // Add click listeners for edit and delete actions
        const editAction = item.querySelector('.edit-action');
        const deleteAction = item.querySelector('.delete-action');
        const checkbox = item.querySelector('input[type="checkbox"]');

        editAction.addEventListener('click', () => {
            editItem(item);
            content.style.transform = 'translateX(0)'; // Reset position after action
        });
        deleteAction.addEventListener('click', () => {
            deleteItem(item);
            content.style.transform = 'translateX(0)'; // Reset position after action
        });
        checkbox.addEventListener('change', () => toggleItem(item));

        // Close swipe actions when clicking outside
        document.addEventListener('click', (e) => {
            if (!item.contains(e.target)) {
                content.style.transform = 'translateX(0)';
            }
        });
    });
}

// Function to toggle item completion
function toggleItem(item) {
    const listIndex = item.dataset.listIndex;
    const itemIndex = item.dataset.itemIndex;
    habitData[activeDay][listIndex].items[itemIndex].done = !habitData[activeDay][listIndex].items[itemIndex].done;
    saveData();
    renderTodoLists();
}

// Function to edit an item
function editItem(item) {
    const listIndex = item.dataset.listIndex;
    const itemIndex = item.dataset.itemIndex;
    const currentItem = habitData[activeDay][listIndex].items[itemIndex];

    const newTitle = prompt('Edit item title:', currentItem.title);
    const newEmoji = prompt('Edit item emoji:', currentItem.emoji);

    if (newTitle !== null && newEmoji !== null) {
        currentItem.title = newTitle;
        currentItem.emoji = newEmoji;
        saveData();
        renderTodoLists();
    }
}

// Function to delete an item
function deleteItem(item) {
    const listIndex = item.dataset.listIndex;
    const itemIndex = item.dataset.itemIndex;

    if (confirm('Are you sure you want to delete this item?')) {
        habitData[activeDay][listIndex].items.splice(itemIndex, 1);
        saveData();
        renderTodoLists();
    }
}

// Function to add a new item
function addItem(listIndex) {
    const title = prompt('Enter item title:');
    const emoji = prompt('Enter an emoji for this item:');
    if (title && emoji) {
        habitData[activeDay][listIndex].items.push({ title, emoji, done: false });
        saveData();
        renderTodoLists();
    }
}

// Function to add a new list
function addList() {
    const title = prompt('Enter list title:');
    if (title) {
        habitData[activeDay].push({ title, items: [] });
        saveData();
        renderTodoLists();
    }
}

// Function to handle tab clicks
function handleTabClick(day) {
    const dayMap = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday'
    };
    activeDay = dayMap[day];
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${Object.keys(dayMap).indexOf(day) + 1})`).classList.add('active');
    renderTodoLists();
}

// Initialize the app
function init() {
    loadData();
    renderTodoLists();

    // Add event listeners to tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => handleTabClick(tab.textContent));
    });

    // Add event listener to settings button
    document.getElementById('settings-btn').addEventListener('click', showSettings);
}

// Function to show settings
function showSettings() {
    const settingsHtml = `
        <h2>Settings</h2>
        <button onclick="exportData()">Export Data</button>
        <input type="file" id="import-file" style="display: none;" onchange="importData(event)">
        <button onclick="document.getElementById('import-file').click()">Import Data</button>
        <button onclick="clearData()">Clear All Data</button>
        <button onclick="closeSettings()">Close</button>
    `;

    const settingsDiv = document.createElement('div');
    settingsDiv.id = 'settings-popup';
    settingsDiv.innerHTML = settingsHtml;
    settingsDiv.style.position = 'fixed';
    settingsDiv.style.top = '50%';
    settingsDiv.style.left = '50%';
    settingsDiv.style.transform = 'translate(-50%, -50%)';
    settingsDiv.style.backgroundColor = 'white';
    settingsDiv.style.padding = '20px';
    settingsDiv.style.borderRadius = '5px';
    settingsDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    document.body.appendChild(settingsDiv);
}

// Function to close settings
function closeSettings() {
    const settingsDiv = document.getElementById('settings-popup');
    if (settingsDiv) {
        settingsDiv.remove();
    }
}

// Function to export data
function exportData() {
    const dataStr = JSON.stringify(habitData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'habit_tracker_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Function to import data
function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            habitData = JSON.parse(e.target.result);
            saveData();
            renderTodoLists();
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data. Please make sure the file is valid JSON.');
        }
    };
    reader.readAsText(file);
}

// Function to clear all data
function clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        habitData = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };
        saveData();
        renderTodoLists();
        alert('All data has been cleared.');
    }
}

// Call init function when the page loads
window.onload = init;