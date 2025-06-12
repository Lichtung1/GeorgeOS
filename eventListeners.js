import { openWindow, promptForPassword } from './windowManager.js';
import { startFirewallGame } from './games.js'; 
/**
 * Initializes all event listeners related to desktop icons and the desktop itself.
 * @param {HTMLElement} desktop The main desktop element.
 */
export function initializeEventListeners(desktop) {
    // --- 1. Generic listener (Correctly ignores #icon-help) ---
    desktop.querySelectorAll('.desktop-icon:not(#icon-mmos):not(#icon-lichtung):not(#icon-moth):not(#icon-cep):not(#icon-settings):not(#icon-help):not(#icon-firewall)').forEach(icon => {        icon.addEventListener('dblclick', () => {
            openWindow(
                icon.dataset.windowId, icon.dataset.windowTitle, icon.dataset.contentType,
                icon.dataset.content, icon.dataset.contentUrl, icon.dataset.contentKey,
                icon.dataset.windowTitleKey
            );
        });
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
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
    const firewallIcon = document.getElementById('icon-firewall');
    if (firewallIcon) {
        firewallIcon.addEventListener('dblclick', () => {
            // This icon now starts the game directly.
            startFirewallGame();
        });
        
        firewallIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            firewallIcon.classList.add('selected');
        });
    }
    // --- 4. Special listener for the Moth (LMG.exe) icon ---
    const mothIcon = document.getElementById('icon-moth');
    if (mothIcon) {
        mothIcon.addEventListener('dblclick', () => {
            promptForPassword();
        });

        mothIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            mothIcon.classList.add('selected');
            promptForPassword();
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
    
    // --- 6. Special listener for the Settings icon ---
    const settingsIcon = document.getElementById('icon-settings');
    if (settingsIcon) {
        settingsIcon.addEventListener('dblclick', () => {
        const settingsContent = document.createElement('div');
        settingsContent.className = 'settings-panel'; // Use our new flex container class

        // Replace your old innerHTML with this new version
        settingsContent.innerHTML = `
            <img src="images/settings_icon.png" alt="Settings Icon" class="settings-icon">
            <div class="settings-content">
                <fieldset>
                    <legend>Desktop Wallpaper</legend>
                    <p>Select a background image for your desktop.</p>
                    <div class="wallpaper-options">
                        <button data-wallpaper="images/win95.jpg">Windows 95</button>
                        <button data-wallpaper="images/XP_GrassandSky.jpg">Windows XP</button>
                        <button data-wallpaper="images/jungle.jpg">Jungle</button>
                        <button data-wallpaper="images/mystery.jpg">Mystery</button>
                        <button data-wallpaper="images/science.jpg">Science</button>
                        <button data-wallpaper="images/davinci.jpg">Da Vinci</button>
                        <button data-wallpaper="images/space_wallpaper.png">Space</button>
                        <button data-wallpaper="">None (Default)</button>
                    </div>
                </fieldset>
            `;

            // Now, we attach click events to our new wallpaper buttons
            const desktop = document.getElementById('desktop');
            settingsContent.querySelectorAll('.wallpaper-options button').forEach(button => {
                button.addEventListener('click', () => {
                    const wallpaperUrl = button.dataset.wallpaper;
                    const desktop = document.getElementById('desktop');

                    if (wallpaperUrl) {
                        desktop.style.backgroundImage = `url('${wallpaperUrl}')`;
                        desktop.style.backgroundRepeat = 'no-repeat';
                        desktop.style.backgroundPosition = 'center center';
                        desktop.style.backgroundSize = 'cover';
                    } else {
                        // This clears the image completely
                        desktop.style.backgroundImage = 'none';
                    }
                });
            });

            // Finally, open the window and pass in our custom HTML content
            openWindow(
                'settings-window',      // Window ID
                'Settings',             // Window Title
                'custom',               // Content Type
                settingsContent,        // The custom HTML element we just built
                null, null, null
            );
        });

        // This makes single-clicking select the icon
        settingsIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            settingsIcon.classList.add('selected');
        });
    }
    const helpIcon = document.getElementById('icon-help');
    if (helpIcon) {
        // This is the ONLY dblclick listener for the help icon.
        helpIcon.addEventListener('dblclick', () => {
            if (localStorage.getItem('help_is_fixed') === 'true') {
                // If help is fixed, open the normal help window with its real content
                openWindow('help-window', 'Help', null, null, null, 'helpContent', 'helpContent');
            } else {
                // Otherwise, show the error to start the puzzle
                showCorruptionError(); 
            }
        });
        
        helpIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
            helpIcon.classList.add('selected');
        });
    }

    // --- Listener for clicking the desktop background ---
    desktop.addEventListener('click', (e) => {
        if (e.target === desktop) {
            desktop.querySelectorAll('.desktop-icon.selected').forEach(s => s.classList.remove('selected'));
        }
    });

}

function showCorruptionError() {
    const errorContent = document.createElement('div');
    
    const corruptedMessage = corruptText("Help Subsystem CORRUPTED.");

    errorContent.innerHTML = `
        <div style="display: flex; align-items: center; padding: 15px 20px;">
            <img src="images/error_icon.png" alt="Error" style="width: 32px; height: 32px; margin-right: 15px;">
            <div>
                <p style="margin:0 0 10px 0;">${corruptedMessage}</p>

                <p style="margin:0;">A manual index rebuild is required.</p>
                <p style="margin-top: 10px;">Use the 'Run' operation to execute the following script:</p>
                
                <b style="margin-top: 5px; display:block; font-family: 'Courier New', monospace;">sys.core\\rebuild.bat</b>
            </div>
        </div>
        <div style="text-align: center; padding-bottom: 15px;">
            <button class="win95-button" id="error-ok-btn" style="min-width: 75px;">OK</button>
        </div>
    `;
    const errorWindow = openWindow('error-help-corrupted', 'System Error', 'custom', errorContent);
    if (errorWindow) {
        errorWindow.querySelector('#error-ok-btn').addEventListener('click', () => {
            errorWindow.querySelector('.close-button').click();
        });
    }
}

function corruptText(text, intensity = 0.6) {
    const diacritics = [
        '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u030a',
        '\u030b', '\u030c', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u033e',
        '\u035e', '\u035f', '\u0360', '\u0361', '\u034a', '\u0316', '\u0317', '\u0318',
        '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325',
        '\u0326', '\u032e', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a',
        '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349', '\u034d', '\u034e',
        '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u035b', '\u035c',
        '\u035d', '\u035e', '\u035f', '\u0360', '\u0361', '\u0362'
    ];
    let corrupted = '';
    for (const char of text) {
        corrupted += char;
        for (let i = 0; i < intensity * 5; i++) {
            if (Math.random() < intensity) {
                corrupted += diacritics[Math.floor(Math.random() * diacritics.length)];
            }
        }
    }
    return corrupted;
}