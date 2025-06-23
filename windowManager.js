import { siteContent } from './contentLoader.js';
import { myArtFiles, myPhotoFiles } from './data.js';

const desktop = document.getElementById('desktop');
const windowTemplate = document.getElementById('window-template');
const taskbarButtonsContainer = document.getElementById('taskbar-buttons-container');

let highestZIndex = 20;
let openWindowCount = 0;
const openWindows = {};

function updateTaskbarButtonStates(activeWindowId) {
    document.querySelectorAll('.taskbar-button').forEach(btn => {
        const windowData = openWindows[btn.dataset.windowId];
        const windowExistsAndVisible = windowData && windowData.element && !windowData.element.classList.contains('minimized');
        if (btn.dataset.windowId === activeWindowId && windowExistsAndVisible) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

export function makeWindowActive(windowElement) {
    if (!windowElement || windowElement.classList.contains('minimized')) return;
    document.querySelectorAll('.window.active').forEach(activeWin => {
        activeWin.classList.remove('active');
        const taskbarBtn = openWindows[activeWin.id]?.taskbarButton;
        if (taskbarBtn) taskbarBtn.classList.remove('active');
    });
    windowElement.classList.add('active');
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;
    updateTaskbarButtonStates(windowElement.id);
    const focusable = windowElement.querySelector('iframe, textarea, input');
    if (focusable) {
        focusable.focus();
    }
}

function makeDraggable(windowElement) {
    const titleBar = windowElement.querySelector('.title-bar');
    if (!titleBar) return;
    let isDragging = false, offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;
        offsetX = clientX - windowElement.offsetLeft;
        offsetY = clientY - windowElement.offsetTop;
        titleBar.style.cursor = 'grabbing';
        windowElement.style.transition = 'none';
        makeWindowActive(windowElement);
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent page scrolling on touch
        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;
        let newX = clientX - offsetX;
        let newY = clientY - offsetY;
        const desktopRect = desktop.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, desktopRect.width - windowElement.offsetWidth));
        newY = Math.max(0, Math.min(newY, desktopRect.height - windowElement.offsetHeight));
        windowElement.style.left = newX + 'px';
        windowElement.style.top = newY + 'px';
    };

    const stopDrag = () => {
        if (isDragging) {
            isDragging = false;
            titleBar.style.cursor = 'grab';
            windowElement.style.transition = '';
        }
    };

    // Mouse Events
    titleBar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    // **** CHANGED: Added Touch Events ****
    titleBar.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

function minimizeWindow(windowElement) {
    if (!windowElement) return;
    windowElement.classList.add('minimized');
    windowElement.classList.remove('active');
    const taskbarButton = openWindows[windowElement.id]?.taskbarButton;
    if (taskbarButton) taskbarButton.classList.remove('active');
    const nextWindow = Array.from(desktop.querySelectorAll('.window:not(.minimized)'))
        .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0))[0];
    if (nextWindow) makeWindowActive(nextWindow);
    else updateTaskbarButtonStates(null);
}

function restoreWindow(windowElement) {
    if (!windowElement) return;
    windowElement.classList.remove('minimized');
    makeWindowActive(windowElement);
}

function makeResizable(windowElement) {
    const resizeHandle = windowElement.querySelector('.resize-handle');
    if (!resizeHandle) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    const computedStyle = getComputedStyle(windowElement);
    const minWidth = parseInt(computedStyle.minWidth, 10) || 150;
    const minHeight = parseInt(computedStyle.minHeight, 10) || 100;

    const onResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;

        // Get starting coordinates from either mouse or touch event
        startX = e.clientX ?? e.touches[0].clientX;
        startY = e.clientY ?? e.touches[0].clientY;

        startWidth = windowElement.offsetWidth;
        startHeight = windowElement.offsetHeight;

        windowElement.style.transition = 'none';
        document.body.style.cursor = 'se-resize';

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);
        document.addEventListener('touchmove', onResizeMove, { passive: false });
        document.addEventListener('touchend', onResizeEnd);
    };

    const onResizeMove = (e) => {
        if (!isResizing) return;

        const clientX = e.clientX ?? e.touches[0].clientX;
        const clientY = e.clientY ?? e.touches[0].clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        let newWidth = startWidth + dx;
        let newHeight = startHeight + dy;

        newWidth = Math.max(newWidth, minWidth);
        newHeight = Math.max(newHeight, minHeight);

        windowElement.style.width = newWidth + 'px';
        windowElement.style.height = newHeight + 'px';
    };

    const onResizeEnd = () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeEnd);
            document.removeEventListener('touchmove', onResizeMove);
            document.removeEventListener('touchend', onResizeEnd);
        }
    };

    // Listen for both mouse and touch events on the handle
    resizeHandle.addEventListener('mousedown', onResizeStart);
    resizeHandle.addEventListener('touchstart', onResizeStart, { passive: false });
}

function manageTaskbarButton(windowElement, title) {
    const windowId = windowElement.id;
    let taskbarButton = openWindows[windowId]?.taskbarButton;
    if (!taskbarButton) {
        taskbarButton = document.createElement('button');
        taskbarButton.className = 'taskbar-button';
        taskbarButton.textContent = title;
        taskbarButton.dataset.windowId = windowId;
        taskbarButton.addEventListener('click', () => {
            const targetWindow = openWindows[windowId]?.element;
            if (targetWindow) {
                if (targetWindow.classList.contains('minimized')) restoreWindow(targetWindow);
                else if (targetWindow.classList.contains('active')) minimizeWindow(targetWindow);
                else makeWindowActive(targetWindow);
            }
        });
        taskbarButtonsContainer.appendChild(taskbarButton);
        if (openWindows[windowId]) {
            openWindows[windowId].taskbarButton = taskbarButton;
        } else {
            openWindows[windowId] = { element: windowElement, minimized: false, taskbarButton: taskbarButton };
        }
    }
    updateTaskbarButtonStates(windowId);
}

export function openWindow(id, htmlTitleFallback, contentType, directContent, contentUrl, contentKey, windowTitleKey, extraClass = null) {
    let windowElement = document.getElementById(id);
    if (windowElement) {
        if (windowElement.classList.contains('minimized')) restoreWindow(windowElement);
        else makeWindowActive(windowElement);
        return windowElement;
    }

    windowElement = windowTemplate.cloneNode(true);
    if (!windowElement) { console.error("Failed to clone window template!"); return null; }
    windowElement.id = id;
    if (extraClass) windowElement.classList.add(extraClass);
    windowElement.style.display = 'none';

    let finalTitle = htmlTitleFallback || 'Window';
    if (windowTitleKey && siteContent[windowTitleKey] && siteContent[windowTitleKey].title) {
        finalTitle = siteContent[windowTitleKey].title;
    }
    const titleSpan = windowElement.querySelector('.title');
    if (titleSpan) titleSpan.textContent = finalTitle;

    const windowBody = windowElement.querySelector('.window-body');
    if (!windowBody) { console.error("Window body not found for", id); desktop.appendChild(windowElement); return windowElement; }
    windowBody.innerHTML = '';

    if (contentKey && siteContent[contentKey] && typeof siteContent[contentKey].text === 'string') {
        const preformattedText = document.createElement('pre');
        preformattedText.textContent = siteContent[contentKey].text.trim();
        preformattedText.style.cssText = `font-family: "Courier New", monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; margin: 0; padding: 5px; word-break: break-word;`;
        windowBody.style.padding = '2px';
        windowBody.appendChild(preformattedText);
        windowElement.style.width = '550px';
        windowElement.style.height = 'auto';
        windowElement.style.minHeight = '300px';
        windowElement.style.maxHeight = 'calc(100vh - 100px)';
    } else if (contentType === 'textarea') {
        const textarea = document.createElement('textarea');
        textarea.value = directContent || 'Type here...';
        windowBody.appendChild(textarea);
    } else if (contentType === 'iframe') {
        const iframe = document.createElement('iframe');
        iframe.src = contentUrl || 'about:blank';
        windowBody.classList.add('iframe-container');
        windowBody.appendChild(iframe);
        windowElement.style.width = '640px';
        windowElement.style.height = '480px';
    } else if (contentType === 'custom-art-list') {
        windowElement.classList.add('art-window');
        const container = document.createElement('div');
        container.className = 'file-list-container';

        const table = document.createElement('table');
        table.className = 'file-list-table';
        table.innerHTML = `<thead><tr><th>Name</th><th>Date Modified</th><th>Type</th><th>Size</th></tr></thead>`;
        const tbody = document.createElement('tbody');
        myArtFiles.forEach(file => {
            const row = document.createElement('tr');
            const iconPath = file.fileType === 'video' ? 'images/video_icon.png' : 'images/image_icon.png';
            row.innerHTML = `<td><div class="file-name-cell"><img src="${iconPath}" alt="file icon" class="file-icon"> ${file.name}</div></td><td>${file.date}</td><td>${file.type}</td><td class="size-cell">${file.size}</td>`;

            row.addEventListener('dblclick', () => {
                const viewerId = `viewer-${file.id}`;
                const viewerTitle = file.name;
                const viewerPath = file.path;

                // Check for the new aspectRatio property
                if (file.aspectRatio === 'square') {
                    // Logic for square windows
                    const shorterDimension = Math.min(desktop.offsetWidth, desktop.offsetHeight);
                    const size = shorterDimension * 0.75; // Make it 75% of the shortest screen side

                    let viewerWindow;
                    if (file.fileType === 'video') {
                        viewerWindow = openWindow(viewerId, viewerTitle, 'video-player', '', viewerPath, null, null);
                    } else { // image
                        viewerWindow = openWindow(viewerId, viewerTitle, 'image-viewer', '', viewerPath, null, null);
                    }

                    if (viewerWindow) {
                        viewerWindow.style.width = size + 'px';
                        viewerWindow.style.height = (size + 30) + 'px'; // Add 30px for title bar
                        // Center the square window
                        viewerWindow.style.left = Math.max(0, (desktop.offsetWidth - size) / 2) + 'px';
                        viewerWindow.style.top = Math.max(0, (desktop.offsetHeight - (size + 30)) / 2) + 'px';
                    }
                } else {
                    // Fallback to the original responsive logic for non-square files
                    if (file.fileType === 'video') {
                        const maxWidth = desktop.offsetWidth * 0.8;
                        const videoWidth = Math.min(854, maxWidth);
                        const videoHeight = videoWidth * (9 / 16);
                        const videoWindow = openWindow(viewerId, viewerTitle, 'video-player', '', viewerPath, null, null);
                        if (videoWindow) {
                            videoWindow.style.width = videoWidth + 'px';
                            videoWindow.style.height = (videoHeight + 30) + 'px';
                            videoWindow.style.left = Math.max(0, (desktop.offsetWidth - videoWidth) / 2) + 'px';
                            videoWindow.style.top = Math.max(0, (desktop.offsetHeight - videoHeight) / 2) + 'px';
                        }
                    } else if (file.fileType === 'image') {
                        const img = new Image();
                        img.src = viewerPath;
                        img.onload = () => {
                            const padding = 60;
                            const maxW = desktop.offsetWidth - padding;
                            const maxH = desktop.offsetHeight - padding;
                            const imgW = img.naturalWidth;
                            const imgH = img.naturalHeight;
                            const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
                            const winW = Math.round(imgW * ratio);
                            const winH = Math.round(imgH * ratio);
                            const imageWindow = openWindow(viewerId, viewerTitle, 'image-viewer', '', viewerPath, null, null);
                            if (imageWindow) {
                                imageWindow.style.width = (winW + 10) + 'px';
                                imageWindow.style.height = (winH + 40) + 'px';
                                imageWindow.style.left = Math.max(0, (desktop.offsetWidth - (winW + 10)) / 2) + 'px';
                                imageWindow.style.top = Math.max(0, (desktop.offsetHeight - (winH + 40)) / 2) + 'px';
                            }
                        };
                        img.onerror = () => { alert("Could not load image: " + viewerPath); };
                    }
                }
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
        windowBody.style.padding = '0';
        windowBody.appendChild(container);
        windowElement.style.width = '650px';
        windowElement.style.height = '400px';
    } else if (contentType === 'custom-photo-list') {
        windowElement.classList.add('photos-window'); // Optional: for custom styling
        const container = document.createElement('div');
        container.className = 'file-list-container';

        const table = document.createElement('table');
        table.className = 'file-list-table';
        table.innerHTML = `<thead><tr><th>Name</th><th>Date Modified</th><th>Type</th><th>Size</th></tr></thead>`;
        const tbody = document.createElement('tbody');

        // Use myPhotoFiles data array
        myPhotoFiles.forEach(file => {
            const row = document.createElement('tr');
            // Since these are all photos, we can use the image icon directly
            const iconPath = 'images/image_icon.png';
            row.innerHTML = `<td><div class="file-name-cell"><img src="${iconPath}" alt="file icon" class="file-icon"> ${file.name}</div></td><td>${file.date}</td><td>${file.type}</td><td class="size-cell">${file.size}</td>`;

            // Add double-click event to open the image viewer
            row.addEventListener('dblclick', () => {
                const viewerId = `viewer-${file.id}`;
                const viewerTitle = file.name;
                const viewerPath = file.path;

                // This logic is copied from your art-list image handler
                const img = new Image();
                img.src = viewerPath;
                img.onload = () => {
                    const padding = 60;
                    const maxW = desktop.offsetWidth - padding;
                    const maxH = desktop.offsetHeight - padding;
                    const imgW = img.naturalWidth;
                    const imgH = img.naturalHeight;
                    const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
                    const winW = Math.round(imgW * ratio);
                    const winH = Math.round(imgH * ratio);
                    const imageWindow = openWindow(viewerId, viewerTitle, 'image-viewer', '', viewerPath, null, null);
                    if (imageWindow) {
                        imageWindow.style.width = (winW + 10) + 'px';
                        imageWindow.style.height = (winH + 40) + 'px';
                        imageWindow.style.left = Math.max(0, (desktop.offsetWidth - (winW + 10)) / 2) + 'px';
                        imageWindow.style.top = Math.max(0, (desktop.offsetHeight - (winH + 40)) / 2) + 'px';
                    }
                };
                img.onerror = () => { alert("Could not load image: " + viewerPath); };
            });
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
        windowBody.style.padding = '0';
        windowBody.appendChild(container);
        windowElement.style.width = '650px';
        windowElement.style.height = '400px';
    } else if (contentType === 'image-viewer') {
        const img = document.createElement('img');
        img.src = contentUrl;
        img.alt = finalTitle;
        windowBody.classList.add('image-viewer-container');
        windowBody.appendChild(img);
    } else if (contentType === 'video-player') {
        const videoPlayerContainer = document.createElement('div');
        videoPlayerContainer.style.cssText = 'width:100%; height:100%; background:black; display:flex; align-items:center; justify-content:center;';
        const videoElement = document.createElement('video');
        videoElement.src = contentUrl;
        videoElement.controls = true;     // Keep controls so user can unmute/pause
        videoElement.autoplay = true;     // **** ADDED: Tell the video to play automatically ****
        videoElement.muted = false;        // **** ADDED: Mute it to allow autoplay ****
        videoElement.loop = true;         // **** ADDED: Make it loop (great for animations) ****
        videoElement.style.cssText = 'max-width:100%; max-height:100%;';
        videoPlayerContainer.appendChild(videoElement);
        windowBody.appendChild(videoPlayerContainer);
    } else if (contentType === 'custom' && directContent instanceof Node) {
        windowBody.appendChild(directContent);
    } else if (directContent) {
        const p = document.createElement('p');
        p.textContent = directContent;
        windowBody.appendChild(p);
    } else {
        const p = document.createElement('p');
        p.textContent = 'Content not specified or type unknown.';
        windowBody.appendChild(p);
    }

    const initialX = 50 + (openWindowCount % 10) * 20;
    const initialY = 50 + (openWindowCount % 10) * 20;
    windowElement.style.left = initialX + 'px';
    windowElement.style.top = initialY + 'px';

    desktop.appendChild(windowElement);
    openWindows[id] = { element: windowElement, minimized: false, taskbarButton: null };
    makeDraggable(windowElement);
    makeResizable(windowElement);
    openWindowCount++;

    const closeButton = windowElement.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const windowData = openWindows[id];
            if (windowData?.element?.parentNode) windowData.element.remove();
            if (windowData?.taskbarButton?.parentNode) windowData.taskbarButton.remove();
            delete openWindows[id];
            const nextTopWindow = Array.from(desktop.querySelectorAll('.window:not(.minimized)'))
                .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0))[0];
            if (nextTopWindow) makeWindowActive(nextTopWindow);
            else updateTaskbarButtonStates(null);
        });
    }

    const minimizeButton = windowElement.querySelector('.minimize-button');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow(openWindows[id]?.element);
        });
    }

    windowElement.addEventListener('mousedown', () => makeWindowActive(openWindows[id]?.element), true);

    windowElement.style.display = 'flex';
    manageTaskbarButton(windowElement, finalTitle);
    makeWindowActive(windowElement);

    const desktopWidth = desktop.offsetWidth;
    const isMobile = desktopWidth <= 768;

    // Replace the old block with this one
    if (isMobile) {
        // NEW: First, check if it's the settings window
        if (id === 'settings-window') {
            windowElement.style.width = '90%';
            windowElement.style.height = '40%'; 
            windowElement.style.left = '5%';
            windowElement.style.top = '10%';   

        } else if (windowElement.classList.contains('explainer-window')) {
            // --- SPECIAL rules for ALL explainer windows on mobile ---
            windowElement.style.width = '80%';
            windowElement.style.height = '35%';
            windowElement.style.left = '10%';
            windowElement.style.top = '15%';

        } else if (id === 'error-help-corrupted') {
            windowElement.style.width = '90%';
            windowElement.style.height = '30%';
            windowElement.style.left = '5%';
            windowElement.style.top = '20%';    

        } 
        else if (id === 'run-dialog') {
            windowElement.style.width = '90%';
            windowElement.style.height = '30%'; 
            windowElement.style.left = '5%';
            windowElement.style.top = '25%';    

        } else if (id === 'find-terminal-window') {
            windowElement.style.width = '90%';
            windowElement.style.height = '30%'; 
            windowElement.style.left = '5%';
            windowElement.style.top = '25%';    

        } else if (id === 'firewall-game') {
            windowElement.style.width = '90%';
            windowElement.style.height = '90%'; 
            windowElement.style.left = '5%';
            windowElement.style.top = '5%';    

        } else if (id === 'treasure-window') {
            windowElement.style.width = '90%';
            windowElement.style.height = '50%'; 
            windowElement.style.left = '5%';
            windowElement.style.top = '35%';    

        } else {
            // Fallback for all other windows 
            windowElement.style.width = '90%';
            windowElement.style.height = '90%';
            windowElement.style.left = '5%';
            windowElement.style.top = '5%';
        }
    }
    return windowElement;
}

export function promptForPassword(title) {
    const dialogId = "password-prompt-dialog";

    return new Promise((resolve) => {
        // Prevent multiple dialogs
        let existingDialog = document.getElementById(dialogId);
        if (existingDialog) {
            makeWindowActive(existingDialog);
            return; // Do nothing if a dialog is already open
        }

        const contentElement = document.createElement('div');
        // This layout now uses a table for precise alignment like in classic Windows dialogs
        contentElement.innerHTML = `
                <div style="display: flex; align-items: flex-start; padding: 2.5px;">
                    <img src="images/key_icon.png" alt="Key" style="width: 32px; height: 32px; margin-right: 10px;">
                    <div style="display: flex; flex-direction: column;">
                        <p style="text-align: left; margin-top: 0; margin-bottom: 5px;">This program is password protected.</p>
                        <p style="text-align: left; margin-top: 0; margin-bottom: 10px;">Please enter the password:</p>
                        <input type="password" id="password-input-field" class="win95-input" style="width: 250px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: center; gap: 6px;">
                            <button class="win95-button" id="password-ok-btn" style="min-width: 75px;">OK</button>
                            <button class="win95-button" id="password-cancel-btn" style="min-width: 75px;">Cancel</button>
                        </div>
                    </div>
                </div>
            `;

        const passwordDialog = openWindow(dialogId, title, "custom", contentElement, "", null, null);

        if (passwordDialog) {
            // Adjust window size for the new layout
            passwordDialog.style.width = 'auto';
            passwordDialog.style.height = 'auto';

            // --- ALL THE LOGIC BELOW REMAINS THE SAME ---

            const passwordInput = passwordDialog.querySelector('#password-input-field');
            const okBtn = passwordDialog.querySelector('#password-ok-btn');
            const cancelBtn = passwordDialog.querySelector('#password-cancel-btn');
            const closeButton = passwordDialog.querySelector('.close-button');

            let wasResolved = false;

            const resolveAndClose = (value) => {
                if (wasResolved) return;
                wasResolved = true;
                observer.disconnect();
                if (document.body.contains(passwordDialog)) {
                    closeButton.click();
                }
                resolve(value);
            };

            okBtn.onclick = () => resolveAndClose(passwordInput.value);
            cancelBtn.onclick = () => resolveAndClose(null);

            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); okBtn.click(); }
                if (e.key === 'Escape') { cancelBtn.click(); }
            });

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((removedNode) => {
                        if (removedNode === passwordDialog && !wasResolved) {
                            wasResolved = true;
                            observer.disconnect();
                            resolve(null);
                        }
                    });
                });
            });

            observer.observe(desktop, { childList: true });

            passwordInput.focus();
        } else {
            resolve(null);
        }
    });
}
export function openWelcomeWindows() {
    // Define IDs and content keys for clarity
    const welcomeId = 'welcome-notepad';
    const welcomeContentKey = 'welcomeNote';
    const photoId = 'photo-viewer-window';
    const photoTitle = 'Operator';
    const photoPath = 'images/ME.png'; // Make sure this path is correct

    // 1. Open the Welcome Notepad
    let welcomeWindow = null;
    if (siteContent[welcomeContentKey]) {
        // We're changing how this window is called to make it a text window
        welcomeWindow = openWindow(
            welcomeId,
            null, // Can be null now
            'text', // Change 'textarea' to 'text'
            null, // Can be null now
            null,
            welcomeContentKey, // Pass the content key here
            welcomeContentKey  // Pass the title key here
        );
        if (welcomeWindow) {
            const desiredWidth = 400; // The width we want on desktop
            const desktopWidth = desktop.offsetWidth;

            // Check if the desired width is wider than the screen
            let finalWidth = desiredWidth;
            if (desiredWidth > desktopWidth) {
                finalWidth = desktopWidth * 0.95; // If so, set the width to 95% of the screen
            }

            // Apply the final calculated width
            welcomeWindow.style.width = finalWidth + 'px';
            welcomeWindow.style.height = '250px';

            // Center the window based on its new final width
            const welcomeLeft = (desktopWidth - finalWidth) / 2;
            welcomeWindow.style.left = Math.max(10, welcomeLeft) + 'px';
            welcomeWindow.style.top = '50px';
        }
    }

    // 2. Open the Image of You, positioned relative to the welcome note
    const img = new Image();
    img.src = photoPath;
    img.onload = () => {
        const welcomeWindowEl = document.getElementById(welcomeId);

        const padding = 100;
        const maxW = desktop.offsetWidth - padding;
        const maxH = desktop.offsetHeight - padding;
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const ratio = Math.min(maxW / imgW, maxH / imgH, 1);
        const winW = Math.round(imgW * ratio);
        const winH = Math.round(imgH * ratio);

        const imageWindow = openWindow(photoId, photoTitle, 'image-viewer', null, photoPath, null, null);

        if (imageWindow) {
            const imageWindowWidth = winW + 10;
            const imageWindowHeight = winH + 40; // Including title bar height
            imageWindow.style.width = imageWindowWidth + 'px';
            imageWindow.style.height = imageWindowHeight + 'px';

            const desktopRect = desktop.getBoundingClientRect();
            const taskbarHeight = 30; // Assuming fixed taskbar height
            
            const maxTopAllowed = desktopRect.height - imageWindowHeight - 5; // 5px safety from taskbar

            let finalImageTop;

            if (welcomeWindowEl) {
                const welcomeBottom = welcomeWindowEl.offsetTop + welcomeWindowEl.offsetHeight;
                let desiredImageTopFromWelcome = welcomeBottom + 10; // 10px gap below welcome window


                finalImageTop = Math.min(desiredImageTopFromWelcome, maxTopAllowed);
            } else {
                let centeredTop = (desktopRect.height - imageWindowHeight) / 2;
                finalImageTop = Math.min(centeredTop, maxTopAllowed);
            }
            
            // Ensure the window doesn't go above the top of the screen (min 10px for title bar)
            finalImageTop = Math.max(10, finalImageTop);

            // Apply the calculated top position
            imageWindow.style.top = finalImageTop + 'px';

            // Always center horizontally
            const imageLeft = (desktop.offsetWidth - imageWindowWidth) / 2;
            imageWindow.style.left = Math.max(10, imageLeft) + 'px'; // Ensure it's not off left edge
        }

        if (welcomeWindowEl) {
            makeWindowActive(welcomeWindowEl);
        }
    };
    img.onerror = () => { console.warn(`Could not load initial photo at: ${photoPath}`); };
}