import { openWindow } from './windowManager.js';

/**
 * Displays the final reward window after successfully completing the game.
 * (This function remains the same)
 */
function showFinalPayload() {
    const treasureContent = document.createElement('div');
    treasureContent.style.padding = '15px';
    treasureContent.innerHTML =
        `<h3>Project Manifest [CONFIDENTIAL]</h3>` +
        `<p>System breach successful. The following experimental tools and archives are now accessible.</p>` +
        `<ul>` +
        `<li><b>Theme Engine:</b> <button class="win95-button" onclick="document.body.classList.toggle('hacker-theme')">Toggle 'Nightmode'</button></li>` +
        `<li><b>Kernel Debugger:</b> <button class="win95-button" onclick="alert('Kernel is stable. No debug necessary.')">Run Diagnostics</button></li>` +
        `<li><b>Secret Archives:</b> <a href="https://archive.org/details/softwarelibrary_msdos_games" target="_blank">Access MS-DOS Game Library</a></li>` +
        `</ul>`;

    openWindow('treasure-window', 'Payload Decrypted', 'custom', treasureContent);
}

/**
 * Initializes and runs the Fallout-style hacking minigame.
 */
export function startFirewallGame() {
    // --- 1. Game Configuration & Word Lists ---
    const ATTEMPTS_ALLOWED = 4;
    const WORDS_PER_GAME = 12;
    // Word list - all words must have the same length (8 characters is good)
    const WORD_BANK = [
        "SYSTEMS", "NETWORK", "FIREWALL", "ROUTERS", "GATEWAY", "PROTOCOL",
        "PACKETS", "PAYLOAD", "CRACKER", "SECURED", "ACCESS", "KERNEL",
        "POINTER", "ADDRESS", "VECTORS", "COMMAND", "EXECUTE", "BINARY",
        "ENCRYPT", "DECRYPT", "TERMINAL", "CONSOLE"
    ];

    // --- 2. Create the Game Window & UI ---
    const gameWrapper = document.createElement('div');
    gameWrapper.className = 'terminal-wrapper';
    gameWrapper.innerHTML = `
        <div id="terminal-main-screen" class="terminal-column"></div>
        <div class="terminal-sidebar terminal-column">
            <h4>> Status Log</h4>
            <div id="terminal-log"></div>
            <div id="terminal-attempts">Attempts Remaining: ${ATTEMPTS_ALLOWED}</div>
        </div>
    `;

    const gameWindow = openWindow('firewall-game', 'Bypass Security Protocol', 'custom', gameWrapper);
    if (!gameWindow) return;

    // Only set a fixed size on desktop screens
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
        gameWindow.style.width = '750px';
        gameWindow.style.height = '500px';
    }

    // --- 3. Game State Variables ---
    const mainScreen = gameWindow.querySelector('#terminal-main-screen');
    const log = gameWindow.querySelector('#terminal-log');
    const attemptsDisplay = gameWindow.querySelector('#terminal-attempts');

    let attemptsLeft = ATTEMPTS_ALLOWED;
    let password = '';
    let isLocked = false;

    // --- 4. Game Logic Functions ---

    /** Adds an entry to the terminal log */
    function logEntry(text) {
        log.innerHTML += `> ${text}<br>`;
        log.scrollTop = log.scrollHeight; // Auto-scroll to bottom
    }

    /** Generates the terminal screen with words and gibberish */
    function generateScreen() {
        // Select a random subset of words for the game
        const gameWords = [...WORD_BANK].sort(() => 0.5 - Math.random()).slice(0, WORDS_PER_GAME);
        password = gameWords[Math.floor(Math.random() * gameWords.length)];

        const JUNK_CHARS = "!@#$%^&*()-=_+[]{};':\",./<>?";
        const BRACKET_PAIRS = ['()', '[]', '{}', '<>'];
        const screenChars = [];
        const TOTAL_CHARS = 16 * 20; // 16 lines of 20 chars

        // Populate screen with junk
        for (let i = 0; i < TOTAL_CHARS; i++) {
            screenChars.push(JUNK_CHARS[Math.floor(Math.random() * JUNK_CHARS.length)]);
        }

        // Place words randomly
        gameWords.forEach(word => {
            const pos = Math.floor(Math.random() * (TOTAL_CHARS - word.length));
            screenChars.splice(pos, word.length, `<span class="word" data-word="${word}">${word}</span>`);
        });

        // Place a few bracket bonuses
        for (let i = 0; i < 4; i++) {
             const pair = BRACKET_PAIRS[Math.floor(Math.random() * BRACKET_PAIRS.length)];
             const pos = Math.floor(Math.random() * (TOTAL_CHARS - 2));
             screenChars.splice(pos, 2, `<span class="bonus" data-bonus="dud">${pair}</span>`);
        }

        mainScreen.innerHTML = screenChars.join('');
        logEntry("Security layer detected. Initializing bypass...");
        logEntry(`Password length: ${password.length}`);
        logEntry(`${WORDS_PER_GAME} potential passwords found.`);
    }

    /** Processes the player's guess */
    function processGuess(guess, targetElement) {
        if (isLocked) return;

        logEntry(`Attempting: ${guess}...`);
        targetElement.classList.add('disabled');

        if (guess === password) {
            endGame(true);
            return;
        }

        attemptsLeft--;
        attemptsDisplay.textContent = `Attempts Remaining: ${attemptsLeft}`;

        // Calculate likeness
        let likeness = 0;
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === password[i]) {
                likeness++;
            }
        }
        logEntry(`Likeness=${likeness}`);

        if (attemptsLeft <= 0) {
            endGame(false);
        }
    }

    /** Processes a click on a bonus bracket */
    function processBonus(targetElement) {
        if (isLocked) return;

        targetElement.classList.add('disabled');
        // 50/50 chance to remove a dud or reset attempts
        if (Math.random() > 0.5) {
            logEntry("Dud removed.");
            const allWords = Array.from(mainScreen.querySelectorAll('.word:not(.disabled)'));
            const dudWords = allWords.filter(el => el.dataset.word !== password);
            if (dudWords.length > 0) {
                const wordToRemove = dudWords[Math.floor(Math.random() * dudWords.length)];
                wordToRemove.classList.add('disabled');
                wordToRemove.textContent = '.'.repeat(password.length);
            }
        } else {
            logEntry("Allowance reset.");
            attemptsLeft = ATTEMPTS_ALLOWED;
            attemptsDisplay.textContent = `Attempts Remaining: ${attemptsLeft}`;
        }
    }

    /** Ends the game */
    function endGame(isWin) {
        isLocked = true;
        if (isWin) {
            logEntry("PASSWORD ACCEPTED.");
            logEntry("ACCESS GRANTED.");
            mainScreen.classList.add('win');
            setTimeout(() => {
                gameWindow.querySelector('.close-button').click();
                showFinalPayload();
            }, 2000);
        } else {
            logEntry("TERMINAL LOCKED");
            logEntry("Connection terminated.");
            mainScreen.classList.add('fail');
            setTimeout(() => {
                gameWindow.querySelector('.close-button').click();
            }, 2500);
        }
    }

    // --- 5. Start the Game ---
    mainScreen.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('word') && !target.classList.contains('disabled')) {
            processGuess(target.dataset.word, target);
        }
        if (target.classList.contains('bonus') && !target.classList.contains('disabled')) {
            processBonus(target);
        }
    });

    generateScreen();
}