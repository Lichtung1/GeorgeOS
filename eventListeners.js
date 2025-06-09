import { openWindow, promptForPassword } from './windowManager.js';

/**
 * Initializes all event listeners related to desktop icons and the desktop itself.
 * @param {HTMLElement} desktop The main desktop element.
 */
export function initializeEventListeners(desktop) {

    // --- 1. Generic listener for all icons that DON'T have special behaviors ---
    desktop.querySelectorAll('.desktop-icon:not(#icon-mmos):not(#icon-lichtung):not(#icon-moth):not(#icon-cep)').forEach(icon => {
        // Double-click to open the window associated with the icon
        icon.addEventListener('dblclick', () => {
            openWindow(
                icon.dataset.windowId,
                icon.dataset.windowTitle,
                icon.dataset.contentType,
                icon.dataset.content,
                icon.dataset.contentUrl,
                icon.dataset.contentKey,
                icon.dataset.windowTitleKey
            );
        });

        // Single-click to select the icon
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents the desktop click listener from firing
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            icon.classList.add('selected');
        });
    });

    // --- 2. Special listener for the MMOS.exe icon ---
    const mmosIcon = document.getElementById('icon-mmos');
    if (mmosIcon) {
        mmosIcon.addEventListener('dblclick', () => {
            const argWindow = openWindow('moyamoya-arg-main-window', 'MOYAMOYA OS', 'iframe', '', 'https://moyamoya.ca', null, null);
            const explainerWindow = openWindow('moyamoya-explainer-window', null, null, null, null, 'moyamoyaLauncher', 'moyamoyaLauncher', 'explainer-window');

            if (explainerWindow) {
                explainerWindow.classList.add('explainer-window');
            }

            // --- Size and position them for DESKTOP ONLY ---
            const isMobile = desktop.offsetWidth <= 768;
            if (!isMobile) {
                if (argWindow) {
                    argWindow.style.width = '800px';
                    argWindow.style.height = '600px';
                    argWindow.style.left = Math.max(0, (desktop.offsetWidth - 800) / 2) + 'px';
                    argWindow.style.top = Math.max(0, (desktop.offsetHeight - 600) / 2) + 'px';
                }
                if (explainerWindow && argWindow) {
                    explainerWindow.style.width = '450px';
                    setTimeout(() => {
                        const leftPos = argWindow.offsetLeft + 40;
                        const topPos = argWindow.offsetTop + 40;
                        explainerWindow.style.left = leftPos + 'px';
                        explainerWindow.style.top = topPos + 'px';
                    }, 0);
                }
            }
        });

        mmosIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            mmosIcon.classList.add('selected');
        });
    }

    // --- 3. Special listener for the Lichtung.exe icon ---
    const lichtungIcon = document.getElementById('icon-lichtung');
    if (lichtungIcon) {
        lichtungIcon.addEventListener('dblclick', () => {
            const artWindow = openWindow('lichtung-art-main-window', 'Where I Cannot Find Him', 'iframe', '', 'https://lichtung1.github.io/Where-I-Cannot-Find-Him-V2/', null, null);
            const explainerWindow = openWindow('lichtung-explainer-window', null, null, null, null, 'lichtungExplainer', 'lichtungExplainer', 'explainer-window');

            const isMobile = desktop.offsetWidth <= 768;
            if (!isMobile) {
                if (artWindow) {
                    artWindow.style.width = '700px';
                    artWindow.style.height = '500px';
                    artWindow.style.left = Math.max(0, (desktop.offsetWidth - 700) / 2) + 'px';
                    artWindow.style.top = Math.max(0, (desktop.offsetHeight - 500) / 2) + 'px';
                }
                if (explainerWindow && artWindow) {
                    explainerWindow.style.width = '350px';
                    setTimeout(() => {
                        const leftPos = artWindow.offsetLeft + 40;
                        const topPos = artWindow.offsetTop + 40;
                        explainerWindow.style.left = leftPos + 'px';
                        explainerWindow.style.top = topPos + 'px';
                    }, 0);
                }
            }
        });

        lichtungIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            lichtungIcon.classList.add('selected');
        });
    }

    // --- 4. Special listener for the Moth (LMG.exe) icon ---
    const mothIcon = document.getElementById('icon-moth');
    if (mothIcon) {
        mothIcon.addEventListener('dblclick', async () => {
            const correctPassword = "metroxylon";
            const enteredPassword = await promptForPassword("Password Required");

            if (enteredPassword === correctPassword) {
                openWindow('lmg-main-window', 'Luana Moth Generator', 'iframe', '', 'https://lichtung1.github.io/LMG/', null, null);
                openWindow('moth-explainer-window', null, null, null, null, 'mothExplainer', 'mothExplainer', 'explainer-window');
            } else if (enteredPassword !== null) {
                alert("Incorrect password.");
            }
        });

        mothIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            mothIcon.classList.add('selected');
        });
    }
    // --- 5. Special listener for the CEP.BAT icon ---
    const cepIcon = document.getElementById('icon-cep');
    if (cepIcon) {
        cepIcon.addEventListener('dblclick', () => {
            // Window 1: The main BBS iframe
            const bbsWindow = openWindow('cep-window', 'CEP BBS', 'iframe', '', 'https://cep.moyamoya.ca', null, null);

            // Window 2: The new explainer window, using the content from content.json
            const explainerWindow = openWindow('cep-explainer-window', null, null, null, null, 'cepExplainer', 'cepExplainer', 'explainer-window');

            // This logic positions the windows on desktop (optional, but good to have)
            const isMobile = desktop.offsetWidth <= 768;
            if (!isMobile) {
                if (bbsWindow) {
                    bbsWindow.style.width = '700px';
                    bbsWindow.style.height = '500px';
                    bbsWindow.style.left = Math.max(0, (desktop.offsetWidth - 700) / 2) + 'px';
                    bbsWindow.style.top = Math.max(0, (desktop.offsetHeight - 500) / 2) + 'px';
                }
                if (explainerWindow && bbsWindow) {
                    explainerWindow.style.width = '350px';
                    setTimeout(() => {
                        const leftPos = bbsWindow.offsetLeft + 40;
                        const topPos = bbsWindow.offsetTop + 40;
                        explainerWindow.style.left = leftPos + 'px';
                        explainerWindow.style.top = topPos + 'px';
                    }, 0);
                }
            }
        });

        cepIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            cepIcon.classList.add('selected');
        });
    }
    // --- 6. Listener for clicking on the empty desktop background ---
    // Its only job is to de-select any selected icons.
    desktop.addEventListener('click', (e) => {
        // If the click happened directly on the desktop and not an icon
        if (e.target === desktop) {
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
        }
    });
}