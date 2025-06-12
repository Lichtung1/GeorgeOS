// js/shutdown.js

// We need the openWindow function to create our dialog
import { openWindow } from './windowManager.js';

/**
 * Creates a modal dialog asking the user to confirm the shutdown.
 * Returns a Promise that resolves with `true` (Yes) or `false` (No/Closed).
 */
function createShutdownDialog() {
    const dialogId = "shutdown-confirm-dialog";

    // Prevent multiple dialogs from opening
    if (document.getElementById(dialogId)) {
        return Promise.resolve(false); // A dialog is already open, so cancel this attempt
    }

    return new Promise(resolve => {
        const contentElement = document.createElement('div');
        // This HTML structure creates the dialog's content
        contentElement.innerHTML = `
            <div style="display: flex; align-items: center; padding: 15px 20px;">
                <img src="images/shutdown_icon.png" alt="Shutdown" style="width: 32px; height: 32px; margin-right: 20px;">
                <p style="margin: 0; font-size: 12px;">Are you sure you want to shut down?</p>
            </div>
            <div style="display: flex; justify-content: center; gap: 6px; padding-bottom: 15px;">
                <button class="win95-button" id="shutdown-yes-btn" style="min-width: 75px;">Yes</button>
                <button class="win95-button" id="shutdown-no-btn" style="min-width: 75px;">No</button>
            </div>
        `;

        // Use existing openWindow function to create a stylish dialog
        const dialogWindow = openWindow(dialogId, "Shut Down", "custom", contentElement);

        if (dialogWindow) {
            // Make the dialog a fixed size and non-resizable
            dialogWindow.style.width = '300px';
            dialogWindow.style.height = 'auto';
            const resizeHandle = dialogWindow.querySelector('.resize-handle');
            if (resizeHandle) resizeHandle.style.display = 'none';

            const yesBtn = dialogWindow.querySelector('#shutdown-yes-btn');
            const noBtn = dialogWindow.querySelector('#shutdown-no-btn');
            const closeButton = dialogWindow.querySelector('.close-button'); // The 'X' button

            // Function to close the dialog and return a value
            const closeAndResolve = (value) => {
                closeButton.click(); // Programmatically click the 'X' to close the window
                resolve(value);
            };

            yesBtn.onclick = () => closeAndResolve(true);
            noBtn.onclick = () => closeAndResolve(false);
            
            // Also resolve as 'false' if the user clicks the 'X' button directly
            const originalCloseClick = closeButton.onclick;
            closeButton.onclick = (e) => {
                originalCloseClick(e); // Run the original close logic
                resolve(false); // Then resolve our promise
            };
            
            yesBtn.focus();
        } else {
            // If the window failed to open for some reason, cancel the shutdown
            resolve(false);
        }
    });
}

// This is the function that closes all windows (from the previous step)
function closeAllWindows() {
    const closeButtons = document.querySelectorAll('#desktop .window:not(#window-template) .close-button');
    const buttonArray = Array.from(closeButtons);
    return new Promise(resolve => {
        if (buttonArray.length === 0) {
            resolve();
            return;
        }
        let i = 0;
        function closeNext() {
            if (i < buttonArray.length) {
                buttonArray[i].click();
                i++;
                setTimeout(closeNext, 75);
            } else {
                setTimeout(resolve, 300);
            }
        }
        closeNext();
    });
}


/**
 * Initiates the full shutdown sequence, starting with a confirmation dialog.
 * This is the only function that needs to be exported now.
 */
export async function initiateShutdown() {
    // 1. Ask the user for confirmation first.
    const shouldShutDown = await createShutdownDialog();

    // 2. Only proceed if the user clicked "Yes".
    if (!shouldShutDown) {
        return; // Exit the function if user said no or closed the dialog
    }

    // 3. Gracefully close all open application windows.
    await closeAllWindows();

    // 4. Create the overlay and messages for the final animation.
    const overlay = document.createElement('div');
    overlay.id = 'shutdown-overlay';
    const message = document.createElement('p');
    message.id = 'shutdown-message';
    message.textContent = 'Shutting down...';
    overlay.appendChild(message);

    const safeOffMessage = document.createElement('div');
    safeOffMessage.id = 'safe-off-message';
    safeOffMessage.textContent = 'It is now safe to turn off your computer.';

    document.body.appendChild(overlay);
    document.body.appendChild(safeOffMessage);

    // 5. Start the fade-to-black animation.
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);

    // 6. After the animation, show the final message.
    setTimeout(() => {
        const desktop = document.getElementById('desktop');
        const taskbar = document.getElementById('taskbar');
        if (desktop) desktop.style.display = 'none';
        if (taskbar) taskbar.style.display = 'none';
        
        overlay.style.backgroundColor = '#000';
        message.style.display = 'none';
        safeOffMessage.style.display = 'block';
    }, 2000);
}