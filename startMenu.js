import { openWindow } from './windowManager.js';
import { initiateShutdown } from './shutdown.js';

// This is a "private" helper function for this module
function closeAllFlyouts() {
    document.querySelectorAll('.flyout-menu.visible').forEach(menu => menu.classList.remove('visible'));
    document.querySelectorAll('.active-flyout-parent').forEach(parent => parent.classList.remove('active-flyout-parent'));
}

export function initializeStartMenu(startButton, startMenu) {
    // --- Start Button and Global Click Listeners ---
    startButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isVisible = startMenu.style.display === 'block';
        startMenu.style.display = isVisible ? 'none' : 'block';
        if (isVisible) closeAllFlyouts();
    });

    document.addEventListener('click', (event) => {
        if (!startMenu.contains(event.target) && event.target !== startButton) {
            startMenu.style.display = 'none';
            closeAllFlyouts();
        }
    });



    // --- MERGED AND CORRECTED LOGIC for Start Menu Items ---
    startMenu.querySelectorAll('li').forEach(item => {
        // This correctly skips the parent items for flyout menus
        if (item.classList.contains('has-flyout')) {
            return; 
        }

        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            const app = item.dataset.app;

            // This is the complete and correct if/else if chain
            if (action === 'shutdown') {
                // initiateShutdown(); // Your shutdown logic
            } else if (action === 'run') {
                // THIS IS THE NEW PART FOR THE RUN COMMAND
                openRunDialog();
            } else if (action === 'open-window') {
                // THIS IS THE ORIGINAL PART FOR 'FIND' THAT WE ARE RESTORING
                openWindow(
                    item.dataset.windowId,
                    item.dataset.windowTitle,
                    item.dataset.contentType,
                    item.dataset.content,
                    item.dataset.contentUrl,
                    item.dataset.contentKey,
                    item.dataset.windowTitleKey
                );
            } else if (action === 'find') {
                openFindTerminal();
            } else if (app) {
                // THIS IS THE ORIGINAL PART FOR 'SETTINGS', 'HELP', ETC.
                const iconToClick = document.getElementById(`icon-${app}`);
                if (iconToClick) {
                    iconToClick.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                }
            }

            // This correctly closes the menu after any action
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
function openRunDialog() {
    const runContent = document.createElement('div');
    runContent.innerHTML = `
        <div style="padding: 15px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="images/run_icon.png" alt="Run" style="width: 32px; height: 32px;">
                <p style="margin:0;">Type the name of a program, folder, or document, and Windows will open it for you.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <label for="run-input"><u>O</u>pen:</label>
                <input type="text" id="run-input" class="win95-input" style="flex-grow: 1;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 6px; padding-top: 5px;">
                <button id="run-ok-btn" class="win95-button" style="min-width: 75px;">OK</button>
                <button id="run-cancel-btn" class="win95-button" style="min-width: 75px;">Cancel</button>
                <button id="run-browse-btn" class="win95-button" style="min-width: 75px;" disabled><u>B</u>rowse...</button>
            </div>
        </div>
    `;

    const runWindow = openWindow('run-dialog', 'Run', 'custom', runContent);
    const input = runWindow.querySelector('#run-input');
    input.focus();

    // Add logic for the OK button
    runWindow.querySelector('#run-ok-btn').addEventListener('click', () => {
        const command = input.value.trim().toLowerCase(); // Make it case-insensitive
        
        // This is where we check for our secret command
        if (command === 'sys.core\\rebuild.bat') {
            runWindow.querySelector('.close-button').click(); // Close the run dialog
            executeRebuild(); // Trigger the payoff!
        } else {
            alert(`Cannot find the file '${command}'. Please check the filename and try again.`);
        }
    });

    // Make the Cancel button work
    runWindow.querySelector('#run-cancel-btn').addEventListener('click', () => {
        runWindow.querySelector('.close-button').click();
    });
}

/**
 * Executes the "System Rebuild" animation and reward.
 */
function executeRebuild() {
    const rebuildContent = document.createElement('div');
    rebuildContent.style.padding = '20px';
    rebuildContent.style.textAlign = 'center';
    rebuildContent.innerHTML = `
        <h3>System Rebuild Complete.</h3>
        <p>Hidden cache 'h4x0r_theme.pak' was found and integrated.</p>
        <p>The 'Hacker' theme has been unlocked and applied.</p>
        <button id="rebuild-ok-btn" class="win95-button" style="min-width: 75px; margin-top: 15px;">Awesome</button>
    `;

    const rebuildWindow = openWindow('rebuild-complete-window', 'System Rebuild', 'custom', rebuildContent);
    
    localStorage.setItem('help_is_fixed', 'true');
    document.body.classList.add('hacker-theme');

    // Find and close the original "Corrupted Help" error window if it's still open.
    const errorWindowToClose = document.getElementById('error-help-corrupted');
    if (errorWindowToClose) {
        // We find its close button and "click" it with code.
        const closeButton = errorWindowToClose.querySelector('.close-button');
        if (closeButton) {
            closeButton.click();
        }
    }

    // Make the OK button on the "Rebuild Complete" window work.
    rebuildWindow.querySelector('#rebuild-ok-btn').addEventListener('click', () => {
        rebuildWindow.querySelector('.close-button').click();
    });
}



function openFindTerminal() {
    const findContent = document.createElement('div');
    findContent.style.cssText = `
        color: #00FF00;
        font-family: 'Courier New', monospace;
        padding: 5px;
        height: 100%;
        display: flex;
        flex-direction: column;
    `;
    findContent.innerHTML = `
        <div id="find-output" style="flex-grow: 1; overflow-y: auto; white-space: pre-wrap;"></div>
        <div style="display: flex; align-items: center; border-top: 1px solid #333; padding-top: 5px;">
            <span>></span>
            <input type="text" id="find-input" style="background: black; color: #00FF00; border: none; width: 100%; margin-left: 5px; outline: none;">
        </div>
    `;

    const findWindow = openWindow('find-terminal-window', 'Find Command', 'custom', findContent);
    const output = findWindow.querySelector('#find-output');
    const input = findWindow.querySelector('#find-input');
    input.focus();

    output.innerHTML = `<p>GEORGE DYCK OS [Version 1.0]<br>Find Utility Initialized. Enter command or type 'help'.</p>`;

    // --- Command Processing Logic ---
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            output.innerHTML += `<p>> ${input.value}</p>`; // Echo the command
            input.value = ''; // Clear the input

            // Process the commands for the hacker hunt
            if (command === 'sys-reset-arg') {
            output.innerHTML += `<p>ARG state cache cleared. System will now reboot.</p>`;
            
            // Remove the two items we saved
            localStorage.removeItem('help_is_fixed');
            localStorage.removeItem('firewall_is_active');
            document.body.classList.remove('hacker-theme');

            // Reboot the page after a short delay
            setTimeout(() => {
                location.reload();
            }, 1500);
            } else if (command === 'help') {
                output.innerHTML += `<p>Supported Commands:<br> - nmap [ip_address]<br> - ftp -k [key] [ip_address]</p>`;
            } else if (command === 'nmap 10.7.7.1') {
            output.innerHTML += `<p>Scanning node 10.7.7.1...<br>Host is up.<br><br>Open Ports:<br>21   (FTP)   - Encrypted Key Required<br>8080 (HTTP)  - Server Response: 503 Service Unavailable<br><br>// Target firewall is now exposed.</p>`;
            
            // Set the flag so we know the firewall is active
            localStorage.setItem('firewall_is_active', 'true');

            // --- ADD THIS NEW BLOCK ---
            // Make the Firewall.exe icon appear on the desktop!
            const firewallIcon = document.getElementById('icon-firewall');
            if (firewallIcon) {
                firewallIcon.style.display = 'block';
                output.innerHTML += `<p style="color:cyan;">// New program 'Firewall.exe' detected on desktop.</p>`;
            }
            } else if (command === 'ftp -k metroxylon 10.7.7.1') {
                output.innerHTML += `<p>Authenticated with key 'metroxylon'. Welcome to Mainframe.<br><br>Directory listing for /:<br>- .profile<br>- server_log.bak<br><span id="payload-file" style="cursor:pointer; text-decoration:underline; color:cyan;">- encrypted_payload.dat</span></p>`;
                
                // Add click listener for the payload file
                findWindow.querySelector('#payload-file').addEventListener('click', () => {
                    output.innerHTML += `<p>> Downloading and decrypting payload...<br>DECRYPTION COMPLETE.<br>See manifest in new window.</p>`;
                    decryptPayload(); // Call the final reward function
                });

            } else {
                output.innerHTML += `<p>COMMAND NOT RECOGNIZED: '${command}'</p>`;
            }
            // Auto-scroll to the bottom
            output.scrollTop = output.scrollHeight;
        }
    });
}


function decryptPayload() {
    const treasureContent = 
        `<h3>Project Manifest [CONFIDENTIAL]</h3>` +
        `<p>A list of experimental tools and hidden system features.</p>` +
        `<ul>` +
        `<li><b>Theme Engine:</b> <button class="win95-button" onclick="document.body.classList.toggle('hacker-theme')">Toggle 'Nightmode'</button></li>`+
        `<li><b>Kernel Debugger:</b> <button class="win95-button" onclick="alert('Kernel is stable. No debug necessary.')">Run Diagnostics</button></li>`+
        `<li><b>Secret Archives:</b> <a href="https://archive.org/details/softwarelibrary_msdos_games" target="_blank">Access MS-DOS Game Library</a></li>`+
        `</ul>`;
    
    openWindow('treasure-window', 'Payload Decrypted', 'custom', treasureContent);
}