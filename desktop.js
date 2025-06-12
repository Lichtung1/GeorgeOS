// js/desktop.js
import { debounce } from './utils.js';
import { initializeEventListeners } from './eventListeners.js';
import { initializeStartMenu } from './startMenu.js';
import { openWelcomeWindows } from './windowManager.js';

export function initializeDesktop() {
    // Get all the core desktop elements once
    const desktop = document.getElementById('desktop');
    const taskbarClock = document.getElementById('taskbar-clock');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');

    // 1. Initialize the clock
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        taskbarClock.textContent = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Initialize icon and desktop click listeners
    initializeEventListeners(desktop);

    // 3. Initialize all start menu functionality
    initializeStartMenu(startButton, startMenu);
    
    // 4. Set up the resize handler
    const handleResize = debounce(() => {
    }, 150);
    window.addEventListener('resize', handleResize);

    // 5. Open the initial windows after everything else is set up
    openWelcomeWindows();
    if (localStorage.getItem('firewall_is_active') === 'true') {
        const firewallIcon = document.getElementById('icon-firewall');
        if (firewallIcon) {
            firewallIcon.style.display = 'block';
        }
    }
}