const templates = {
    '1': {
        title: 'FEBRUARY/15/2026 FLOW',
        startTime: '9:00 am',
        items: [
            { duration: '25 Min', activity: 'Y.I.C', owner: '' },
            { duration: '5 Min', activity: 'Call To Worship', owner: 'MP' },
            { duration: '15 Min', activity: 'Praise & Worship', owner: 'MP' },
            { duration: '7 Min', activity: 'Prayer Session 1', owner: 'MLA' },
            { duration: '7 Min', activity: 'Prayer Session 2', owner: 'Kore' },
            { duration: '4 Min', activity: 'Confession', owner: 'Onyin' },
            { duration: '7 Min', activity: 'Prayer Session 3', owner: 'Onyin' },
            { duration: '10 Min', activity: 'Special Number', owner: 'M.P' },
            { duration: '30 Min', activity: 'The Word', owner: '' },
            { duration: '5 Min', activity: 'Q&A', owner: '' },
            { duration: '5 Min', activity: 'Welcome ⬇️⬇️⬇️ Offering', owner: 'PJ' },
            { duration: '', activity: 'Closing', owner: '' }
        ]
    },
    '2': {
        title: 'FEBRUARY/15/2026 FLOW (Two Services)',
        startTime: '8:00 am',
        items: [
            { duration: '90 Min', activity: 'First Service', owner: 'Morning Team' },
            { duration: '30 Min', activity: 'Intermission', owner: '' },
            { duration: '90 Min', activity: 'Second Service', owner: 'Afternoon Team' },
            { duration: '', activity: 'Closing', owner: '' }
        ]
    },
    'tg-1': {
        title: 'FEBRUARY/01/2026 FLOW [Thanksgiving]',
        startTime: '9:00 am',
        items: [
            { duration: '25 Min', activity: 'Y.I.C', owner: '' },
            { duration: '5 Min', activity: 'Call To Worship', owner: 'MP' },
            { duration: '15 Min', activity: 'Praise & Worship', owner: 'MP' },
            { duration: '10 Min', activity: 'Congregational Prayer / Confession', owner: 'Onyin' },
            { duration: '15 Min', activity: 'Testimony', owner: 'P.Shegs' },
            { duration: '10 Min', activity: 'Shop For Free Info', owner: '' },
            { duration: '10 Min', activity: 'Special Number', owner: 'M.P' },
            { duration: '15 Min', activity: 'The Word', owner: '' },
            { duration: '10 Min', activity: 'Thanksgiving', owner: 'MLA' },
            { duration: '5 Min', activity: 'Welcome ⬇️⬇️⬇️ Offering', owner: 'PJ' },
            { duration: '', activity: 'Closing', owner: '' }
        ]
    },
    'wed-p': {
        title: 'WINNING EDGE PHYSICAL FLOW',
        startTime: '6:30 pm',
        items: [
            { duration: '15 Min', activity: 'Opening Prayer', owner: '' },
            { duration: '20 Min', activity: 'Praise & Worship', owner: '' },
            { duration: '40 Min', activity: 'The Word', owner: '' },
            { duration: '10 Min', activity: 'Offering & Announcements', owner: '' },
            { duration: '', activity: 'Closing', owner: '' }
        ]
    },
    'wed-v': {
        title: 'WINNING EDGE VIRTUAL FLOW',
        startTime: '7:00 pm',
        items: [
            { duration: '5 Min', activity: 'Countdown', owner: 'Video' },
            { duration: '15 Min', activity: 'Praise & Worship', owner: 'Video' },
            { duration: '25 Min', activity: 'Sermon', owner: 'Video' },
            { duration: '1 Min', activity: 'Offering', owner: 'Video' },
            { duration: '5 Min', activity: 'First Timer Recognition', owner: 'Video' },
            { duration: '', activity: 'Closing', owner: 'Video' }
        ]
    }
};

let state = JSON.parse(JSON.stringify(templates['1'])); // Deep copy default

// Selectors
const inputTitle = document.getElementById('input-title');
const inputDate = document.getElementById('input-date');
const inputStartTime = document.getElementById('input-start-time');
const selectTemplate = document.getElementById('select-template');
const itemsContainer = document.getElementById('items-container');
const addItemBtn = document.getElementById('add-item');
const exportBtn = document.getElementById('export-pdf');

const previewTitle = document.getElementById('preview-title');
const previewBody = document.getElementById('preview-body');
const itemFormTemplate = document.getElementById('item-form-template');

// Helper: Parse time string "9:00 am" or "19:00" into minutes from midnight
function parseTime(timeStr) {
    if (!timeStr) return 0;
    let [time, modifier] = timeStr.toLowerCase().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'pm' && hours < 12) hours += 12;
    if (modifier === 'am' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

// Helper: Format minutes from midnight into "h:mm am/pm"
function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    let modifier = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${mins.toString().padStart(2, '0')} ${modifier}`;
}

// Helper: Extract minutes from duration string "25 Min" or "10-15 minutes"
// If a range is given, it takes the last number (the maximum duration).
function parseDuration(durationStr) {
    if (!durationStr) return 0;
    const matches = durationStr.match(/(\d+)/g);
    if (!matches) return 0;
    return parseInt(matches[matches.length - 1], 10);
}

// State persistence
function saveState() {
    localStorage.setItem('serviceFlowState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('serviceFlowState');
    if (saved) {
        state = JSON.parse(saved);
        // Sync inputs with loaded state
        inputTitle.value = state.title || '';
        inputDate.value = state.date || '';
        inputStartTime.value = state.startTime || '';
        if (state.templateKey) {
            selectTemplate.value = state.templateKey;
        }
    }
}

// Export History
function getHistory() {
    const saved = localStorage.getItem('serviceExportHistory');
    return saved ? JSON.parse(saved) : {};
}

function saveToHistory() {
    const history = getHistory();
    const title = state.title || 'Untitled Service';
    history[title] = JSON.parse(JSON.stringify(state));
    localStorage.setItem('serviceExportHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = getHistory();
    const container = document.getElementById('history-container');
    const titles = Object.keys(history);

    if (titles.length === 0) {
        container.innerHTML = '<p class="empty-state">No exported services yet.</p>';
        return;
    }

    container.innerHTML = '';
    titles.forEach(title => {
        const item = history[title];
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-date">${item.date || 'No Date'}</div>
            <div class="history-title">${title}</div>
        `;
        div.onclick = () => {
            if (confirm(`Load saved state for "${title}"? This will overwrite your current progress.`)) {
                state = JSON.parse(JSON.stringify(item));
                saveState();
                renderBuilder();
                updatePreview();
            }
        };
        container.appendChild(div);
    });
}

function renderBuilder() {
    console.log('Rendering Builder with state:', state.title);
    inputTitle.value = state.title || '';
    inputDate.value = state.date || '';
    inputStartTime.value = state.startTime || '';
    
    itemsContainer.innerHTML = '';
    state.items.forEach((item, index) => {
        const card = itemFormTemplate.content.cloneNode(true).querySelector('.item-form-card');
        
        card.querySelector('.item-index').textContent = `Item ${index + 1}`;
        card.querySelector('.field-time').parentElement.style.display = 'none';
        card.querySelector('.field-duration').value = item.duration;
        card.querySelector('.field-activity').value = item.activity;
        card.querySelector('.field-owner').value = item.owner;

        card.querySelector('.field-duration').oninput = (e) => { 
            item.duration = e.target.value; 
            saveState();
            updatePreview(); 
        };
        card.querySelector('.field-activity').oninput = (e) => { 
            item.activity = e.target.value; 
            saveState();
            updatePreview(); 
        };
        card.querySelector('.field-owner').oninput = (e) => { 
            item.owner = e.target.value; 
            saveState();
            updatePreview(); 
        };

        card.querySelector('.move-up').onclick = () => {
            if (index > 0) {
                const temp = state.items[index];
                state.items[index] = state.items[index - 1];
                state.items[index - 1] = temp;
                saveState();
                renderBuilder();
                updatePreview();
            }
        };

        card.querySelector('.move-down').onclick = () => {
            if (index < state.items.length - 1) {
                const temp = state.items[index];
                state.items[index] = state.items[index + 1];
                state.items[index + 1] = temp;
                saveState();
                renderBuilder();
                updatePreview();
            }
        };

        card.querySelector('.remove-item').onclick = () => {
            state.items.splice(index, 1);
            saveState();
            renderBuilder();
            updatePreview();
        };

        itemsContainer.appendChild(card);
    });
}

function updatePreview() {
    previewTitle.innerHTML = `
        <div class="preview-date">${state.date || ''}</div>
        <div class="preview-main-title">${state.title || ''}</div>
    `;
    previewBody.innerHTML = '';

    let currentMinutes = parseTime(state.startTime);

    state.items.forEach(item => {
        const tr = document.createElement('tr');
        
        const startTimeStr = formatTime(currentMinutes);
        let timeDisplay = `<strong>${startTimeStr}</strong>`;
        if (item.duration) timeDisplay += ` (${item.duration})`;
        if (item.owner) timeDisplay += `<br>${item.owner}`;
        
        tr.innerHTML = `
            <td class="time-cell">${timeDisplay}</td>
            <td class="activity-cell">${item.activity}</td>
        `;

        previewBody.appendChild(tr);

        // Increment time for next item
        currentMinutes += parseDuration(item.duration);
    });
}

// Global Events
inputTitle.oninput = (e) => {
    state.title = e.target.value;
    saveState();
    updatePreview();
};

inputDate.oninput = (e) => {
    state.date = e.target.value;
    saveState();
    updatePreview();
};

inputStartTime.oninput = (e) => {
    state.startTime = e.target.value;
    saveState();
    updatePreview();
};

selectTemplate.onchange = (e) => {
    const templateKey = e.target.value;
    
    if (!confirm('Changing the template will overwrite your current progress. Do you want to continue?')) {
        // Reset the dropdown back to the current active template if cancelled
        e.target.value = state.templateKey || '1';
        return;
    }
    
    console.log('Template changed to:', templateKey);
    
    if (templates[templateKey]) {
        state = JSON.parse(JSON.stringify(templates[templateKey]));
        state.templateKey = templateKey; // Save key for persistence
        console.log('New state loaded:', state.title);
        saveState();
        renderBuilder();
        updatePreview();
    } else {
        console.error('Template not found:', templateKey);
    }
};

addItemBtn.onclick = () => {
    state.items.push({ duration: '', activity: '', owner: '' });
    saveState();
    renderBuilder();
    updatePreview();
};

exportBtn.onclick = () => {
    saveToHistory();
    window.print();
};

// Calendar Data
async function fetchCalendar() {
    try {
        const response = await fetch('calendar.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        renderCalendar(data.months[0]); // Render the first month (March 2026)
    } catch (error) {
        console.error('Error loading calendar:', error);
        document.getElementById('calendar-reference').innerHTML = '<p class="error">Failed to load calendar data.</p>';
    }
}

function renderCalendar(month) {
    const container = document.getElementById('calendar-reference');
    if (!month) return;

    let html = `
        <h4>${month.name}</h4>
        <div class="theme-box">
            <span class="theme-label">Theme / Text</span>
            <strong>${month.theme}</strong><br>
            <span style="font-size: 0.75rem;">${month.text}</span>
        </div>
        <div class="topic-list">
    `;

    // Sundays
    month.sundays.forEach(s => {
        html += `
            <div class="topic-row">
                <span class="topic-date">${s.date}</span>
                <span class="topic-name">${s.topic}</span>
            </div>
        `;
    });

    html += '<hr style="margin: 0.5rem 0; border: none; border-top: 1px dashed var(--border);">';

    // Wednesdays
    month.wednesdays.forEach(w => {
        html += `
            <div class="topic-row">
                <span class="topic-date">${w.date}</span>
                <span class="topic-name">${w.topic}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Initial Load and Render
loadState();
renderBuilder();
updatePreview();
renderHistory();
fetchCalendar();

// Mobile Tab Switching
const tabBuilder = document.getElementById('tab-builder');
const tabPreview = document.getElementById('tab-preview');
const builderPanel = document.querySelector('.builder-panel');
const previewPanel = document.querySelector('.preview-panel');

function isMobile() {
    return window.innerWidth <= 768;
}

function setMobileTab(tab) {
    if (tab === 'builder') {
        builderPanel.classList.remove('mobile-hidden');
        previewPanel.classList.add('mobile-hidden');
        tabBuilder.classList.add('active');
        tabPreview.classList.remove('active');
    } else {
        builderPanel.classList.add('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
        tabBuilder.classList.remove('active');
        tabPreview.classList.add('active');
    }
}

tabBuilder.onclick = () => setMobileTab('builder');
tabPreview.onclick = () => setMobileTab('preview');

// Set initial mobile state
if (isMobile()) {
    previewPanel.classList.add('mobile-hidden');
}

// Handle resize
window.addEventListener('resize', () => {
    if (!isMobile()) {
        builderPanel.classList.remove('mobile-hidden');
        previewPanel.classList.remove('mobile-hidden');
    } else if (!tabPreview.classList.contains('active')) {
        previewPanel.classList.add('mobile-hidden');
    }
});
