import { openWindow } from './windowManager.js';

// This is a "private" helper function for this module
function closeAllFlyouts() {
    document.querySelectorAll('.flyout-menu.visible').forEach(menu => {
        menu.classList.remove('visible');
    });
    document.querySelectorAll('.active-flyout-parent').forEach(parent => {
        parent.classList.remove('active-flyout-parent');
    });
}

// This is the main function we'll export and call from desktop.js
export function initializeStartMenu(startButton, startMenu) {
    // --- Start Button and Global Click Listeners ---
    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = startMenu.style.display === 'block';
        startMenu.style.display = isVisible ? 'none' : 'block';
        if (isVisible) { // If we just hid it
            closeAllFlyouts();
        }
    });

    document.addEventListener('click', (event) => {
        if (!startMenu.contains(event.target) && event.target !== startButton) {
            startMenu.style.display = 'none';
            closeAllFlyouts();
        }
    });

    // --- Logic for regular start menu items ---
    startMenu.querySelectorAll('li').forEach(item => {
        if (item.classList.contains('has-flyout')) {
            return; // Skip parents, they are handled below
        }
        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            if (action === 'open-window') {
                openWindow(
                    item.dataset.windowId, item.dataset.windowTitle, item.dataset.contentType,
                    item.dataset.content, item.dataset.contentUrl, item.dataset.contentKey,
                    item.dataset.windowTitleKey
                );
            }
            startMenu.style.display = 'none';
            closeAllFlyouts();
        });
    });


        // --- START MENU FLY-OUT LOGIC ---
    let flyoutTimeout; 
    const flyoutParents = document.querySelectorAll('.start-menu .has-flyout');

    // A single loop to handle all flyout logic
    flyoutParents.forEach(parent => {
        const flyoutMenu = parent.querySelector('.flyout-menu');
        if (!flyoutMenu) return;

        // --- Logic for MOBILE Taps (using touchstart) ---
        parent.addEventListener('touchstart', (event) => {
            // Only run this logic on mobile-sized screens
            if (window.innerWidth >= 769) {
                return;
            }

            // This is the fix for the two-tap issue on mobile.
            // It prevents the browser from waiting for a 'click'.
            event.preventDefault();
            event.stopPropagation();
            
            const isAlreadyVisible = flyoutMenu.classList.contains('visible');

            // Always close all flyouts first.
            closeAllFlyouts();
            
            // If the menu we tapped wasn't already open, show it.
            // This creates a clean "tap-to-open, tap-somewhere-else-to-close" behavior.
            if (!isAlreadyVisible) {
                parent.classList.add('active-flyout-parent');
                flyoutMenu.classList.add('visible');
            }
        }, { passive: false }); // Required for preventDefault() to work reliably


        // --- Logic for DESKTOP Hover ---
        const openMenu = () => {
            clearTimeout(flyoutTimeout);
            closeAllFlyouts();
            parent.classList.add('active-flyout-parent');
            flyoutMenu.classList.add('visible');
        };

        const closeMenu = () => {
            flyoutTimeout = setTimeout(() => {
                closeAllFlyouts();
            }, 50);
        };

        parent.addEventListener('mouseenter', openMenu);
        parent.addEventListener('mouseleave', closeMenu);
        flyoutMenu.addEventListener('mouseenter', () => clearTimeout(flyoutTimeout));
        flyoutMenu.addEventListener('mouseleave', closeMenu);
    });
    const flyoutItems = document.querySelectorAll('.flyout-menu li');

    flyoutItems.forEach(item => {
        // Skip any list items that are just separators
        if (item.classList.contains('separator')) {
            return;
        }

        // This is the core action: find the app icon and launch it.
        const launchApp = () => {
            const appToLaunch = item.dataset.app;
            if (!appToLaunch) return;

            let iconToClick;
            switch (appToLaunch) {
                case 'moth':
                    iconToClick = document.getElementById('icon-moth');
                    break;
                case 'mmos':
                    iconToClick = document.getElementById('icon-mmos');
                    break;
                case 'lichtung':
                    iconToClick = document.getElementById('icon-lichtung');
                    break;
                case 'art-folder':
                    iconToClick = document.getElementById('icon-art-folder');
                    break;
                case 'photos-folder':
                    iconToClick = document.getElementById('icon-photos-folder');
                    break;
                case 'operator-log':
                    iconToClick = document.getElementById('icon-operator-log');
                    break;
            }

            if (iconToClick) {
                const dblClickEvent = new MouseEvent('dblclick', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                iconToClick.dispatchEvent(dblClickEvent);
            }

            startMenu.style.display = 'none';
            closeAllFlyouts();
        };

        // For MOBILE: Listen for the 'touchstart' event.
        item.addEventListener('touchstart', (event) => {
            event.stopPropagation(); // Stop the event from bubbling to the parent
            event.preventDefault();  // Prevents the browser from firing a "ghost click"
            launchApp();
        }, { passive: false });

        // For DESKTOP: Also listen for the 'click' event.
        item.addEventListener('click', launchApp);
    });
}