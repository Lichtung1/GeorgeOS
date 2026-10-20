// ──────────────────────────────────────────────────────────────
//  The hidden ARG layer:
//  Help (corrupted) → Run "sys.core/rebuild.bat" → Help reveals node
//  10.7.7.1 → Find: "nmap 10.7.7.1" → Firewall.exe appears → hacking
//  minigame → payload.   ("sys-reset-arg" in Find resets everything.)
// ──────────────────────────────────────────────────────────────
import { el, store } from './util.js';
import { openWindow, closeWindow, getWindow } from './wm.js';
import { msgBox, openText, openMyWork, openArtFolder, openPhotosFolder, openSettings, openCV, openLauncher } from './apps.js';

export const flags = {
  get helpFixed() { return store.get('help_is_fixed') === 'true'; },
  get firewall() { return store.get('firewall_is_active') === 'true'; },
};

export function applyFlags() {
  document.body.classList.toggle('hacker-theme', flags.helpFixed && store.get('nightmode') !== 'off');
  const fw = document.getElementById('icon-firewall');
  if (fw) fw.hidden = !flags.firewall;
}

/* ── Help ── */
export function openHelp() {
  if (flags.helpFixed) return openText('help');
  msgBox({ id: 'help-error', title: 'System Error', html: `
      <p>${corrupt('Help Subsystem CORRUPTED.')}</p>
      <p>A manual index rebuild is required.</p>
      <p>Use the <b>Run</b> operation in the Start menu to execute the following script:</p>
      <p><code>sys.core/rebuild.bat</code></p>` });
}

function corrupt(text, intensity = 0.6) {
  let out = '';
  for (const ch of text) {
    out += ch;
    for (let i = 0; i < 3; i++) if (Math.random() < intensity) out += String.fromCharCode(0x0300 + Math.floor(Math.random() * 0x60));
  }
  return out;
}

/* ── Run… ── */
const RUN_COMMANDS = {
  'sys.core/rebuild.bat': () => rebuild(),
  'notepad': () => openText('welcome'),
  'welcome.txt': () => openText('welcome'),
  'operator.log': () => openText('operatorLog'),
  'explorer': () => openMyWork(),
  'my work': () => openMyWork(),
  'art': () => openArtFolder(),
  'photos': () => openPhotosFolder(),
  'control': () => openSettings(),
  'cv': () => openCV('artist'), 'cv.pdf': () => openCV('artist'), 'artist_cv.pdf': () => openCV('artist'),
  'academic': () => openCV('academic'), 'academic_cv.pdf': () => openCV('academic'),
  'mmos': () => openLauncher('mmos'), 'mmos.exe': () => openLauncher('mmos'),
  'cep': () => openLauncher('cep'), 'cep.bat': () => openLauncher('cep'),
  'luana_moth.exe': () => openLauncher('moth'),
  'text_dissolution.exe': () => openLauncher('lichtung'),
  'find': () => openFind(),
  'cmd': () => openFind(), 'command': () => openFind(),
};

export function openRun() {
  const input = el('input', { type: 'text', id: 'run-input', autocomplete: 'off', spellcheck: 'false' });
  const ok = () => {
    const cmd = input.value.trim().toLowerCase();
    const fn = RUN_COMMANDS[cmd];
    closeWindow('run');
    if (fn) fn();
    else if (cmd) msgBox({ title: input.value.trim(), text: `Cannot find the file '${input.value.trim()}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.` });
  };
  // preventDefault stops the Enter keypress from also 'clicking' the next dialog's focused button
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ok(); } if (e.key === 'Escape') closeWindow('run'); });
  const body = el('div', { class: 'run' },
    el('div', { class: 'msgbox-main' }, el('img', { src: 'images/run_icon.png', alt: '', width: 32, height: 32 }),
      el('p', {}, 'Type the name of a program, folder, or document, and GeorgeOS will open it for you.')),
    el('div', { class: 'field-row' }, el('label', { for: 'run-input' }, el('u', {}, 'O'), 'pen:'), input),
    el('div', { class: 'msgbox-buttons' },
      el('button', { onclick: ok }, 'OK'),
      el('button', { onclick: () => closeWindow('run') }, 'Cancel'),
      el('button', { disabled: true }, el('u', {}, 'B'), 'rowse...')));
  openWindow({ id: 'run', title: 'Run', body, width: 380, x: 8, y: 'center', resizable: false, maximizable: false, mobile: 'dialog' });
  input.focus();
}

function rebuild() {
  store.set('help_is_fixed', 'true');
  closeWindow('help-error');
  applyFlags();
  msgBox({ id: 'rebuild', title: 'System Rebuild', icon: 'images/help_icon.png', buttons: ['Awesome'], html: `
    <p><b>System Rebuild Complete.</b></p>
    <p>Hidden cache 'h4x0r_theme.pak' was found and integrated.</p>
    <p>The 'Hacker' theme has been unlocked and applied.</p>
    <p>The Help file is readable again.</p>` });
}

/* ── Find (terminal) ── */
export function openFind() {
  const out = el('div', { class: 'term-out', 'aria-live': 'polite' });
  const input = el('input', { type: 'text', class: 'term-input', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Command' });
  const print = (text, cls) => { out.append(el('div', { class: cls }, text)); out.scrollTop = out.scrollHeight; };
  const body = el('div', { class: 'terminal', onclick: () => input.focus() }, out, el('div', { class: 'term-line' }, el('span', {}, '>'), input));

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const raw = input.value; const cmd = raw.trim().toLowerCase();
    input.value = '';
    print('> ' + raw, 'echo');
    if (!cmd) return;
    if (cmd === 'help') print('Supported commands:\n  nmap [ip_address]\n  ftp -k [key] [ip_address]\n  cls');
    else if (cmd === 'cls' || cmd === 'clear') out.replaceChildren();
    else if (cmd === 'sys-reset-arg') {
      print('ARG state cache cleared. System will now reboot.');
      ['help_is_fixed', 'firewall_is_active', 'nightmode'].forEach(k => store.remove(k));
      setTimeout(() => location.reload(), 1500);
    } else if (cmd === 'nmap 10.7.7.1') {
      print('Scanning node 10.7.7.1...\nHost is up.\n\nOpen Ports:\n21   (FTP)  - Encrypted Key Required\n8080 (HTTP) - Server Response: 503 Service Unavailable\n\n// Target firewall is now exposed.');
      store.set('firewall_is_active', 'true');
      applyFlags();
      print("// New program 'Firewall.exe' detected on desktop.", 'hl');
    } else if (cmd.startsWith('nmap')) print('Note: Host seems down.');
    else if (cmd === 'ftp -k metroxylon 10.7.7.1') {
      print("Authenticated with key 'metroxylon'. Welcome to Mainframe.\n\nDirectory listing for /:\n- .profile\n- server_log.bak");
      out.append(el('button', { class: 'term-link', onclick: () => { print('> Downloading and decrypting payload...\nDECRYPTION COMPLETE.\nSee manifest in new window.'); showPayload(); } }, '- encrypted_payload.dat'));
    } else if (cmd.startsWith('ftp')) print('530 Login authentication failed.');
    else print(`COMMAND NOT RECOGNIZED: '${cmd}'`);
  });

  openWindow({ id: 'find', title: 'Find Command', icon: 'images/find_icon.png', body, width: 560, height: 340, className: 'term-window' });
  print("GEORGE DYCK OS [Version 2.0]\nFind Utility Initialized. Enter command or type 'help'.");
  input.focus();
}

/* ── Firewall.exe: Fallout-style hacking minigame ── */
const WORD_BANK = ['SYSTEMS', 'NETWORK', 'ROUTERS', 'GATEWAY', 'PACKETS', 'PAYLOAD', 'CRACKER', 'SECURED',
  'POINTER', 'ADDRESS', 'VECTORS', 'COMMAND', 'EXECUTE', 'ENCRYPT', 'DECRYPT', 'CONSOLE', 'BOOTING', 'KERNELS', 'PROGRAM', 'STORAGE'];

export function startFirewall() {
  const ATTEMPTS = 4, N_WORDS = 12, COLS = 2, ROWS = 16, WIDTH = 12;
  const JUNK = '!@#$%^&*-=_+;:,./?|\\';
  const words = [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, N_WORDS);
  const password = words[Math.floor(Math.random() * words.length)];
  let attempts = ATTEMPTS, locked = false;

  // Build the memory dump: a flat array of cells; words/brackets occupy non-overlapping slots.
  const total = COLS * ROWS * WIDTH;
  const cells = Array.from({ length: total }, () => ({ ch: JUNK[Math.floor(Math.random() * JUNK.length)] }));
  const slotSize = Math.floor(total / (N_WORDS + 4));
  const slots = [...Array(N_WORDS + 4).keys()].sort(() => Math.random() - 0.5);
  words.forEach((w, k) => {
    const start = slots[k] * slotSize + Math.floor(Math.random() * (slotSize - w.length));
    for (let j = 0; j < w.length; j++) cells[start + j] = { ch: w[j], word: w, start };
  });
  ['()', '[]', '{}', '<>'].forEach((pair, k) => {
    const start = slots[N_WORDS + k] * slotSize + Math.floor(Math.random() * (slotSize - 4));
    cells[start] = { ch: pair[0], bonus: start }; cells[start + 1] = { ch: 'x', bonus: start }; cells[start + 2] = { ch: pair[1], bonus: start };
  });

  const screen = el('div', { class: 'fw-screen' });
  const log = el('div', { class: 'fw-log' });
  const attemptsEl = el('div', { class: 'fw-attempts' });
  const logLine = (t) => { log.append(el('div', {}, '> ' + t)); log.scrollTop = log.scrollHeight; };
  const drawAttempts = () => { attemptsEl.textContent = `ATTEMPTS: ${'■ '.repeat(attempts)}`; };

  for (let c = 0; c < COLS; c++) {
    const col = el('div', { class: 'fw-col' });
    for (let r = 0; r < ROWS; r++) {
      const line = el('div', { class: 'fw-row' }, el('span', { class: 'fw-addr' }, '0x' + (0xF4A0 + (c * ROWS + r) * WIDTH).toString(16).toUpperCase() + ' '));
      let i = (c * ROWS + r) * WIDTH;
      const end = i + WIDTH;
      while (i < end) {
        const cell = cells[i];
        if (cell.word && cell.start === i) {
          line.append(el('button', { class: 'fw-word', 'data-word': cell.word }, cell.word.slice(0, end - i)));
          i += Math.min(cell.word.length, end - i);
        } else if (cell.word) {
          // word continuing from previous line
          const rest = cell.word.length - (i - cell.start);
          line.append(el('button', { class: 'fw-word', 'data-word': cell.word }, cell.word.slice(i - cell.start, i - cell.start + Math.min(rest, end - i))));
          i += Math.min(rest, end - i);
        } else if (cell.bonus === i && i + 2 < end) {
          line.append(el('button', { class: 'fw-bonus' }, cell.ch + cells[i + 1].ch + cells[i + 2].ch));
          i += 3;
        } else { line.append(document.createTextNode(cell.bonus !== undefined ? '.' : cell.ch)); i++; }
      }
      col.append(line);
    }
    screen.append(col);
  }

  screen.addEventListener('click', (e) => {
    if (locked) return;
    const w = e.target.closest('.fw-word'); const b = e.target.closest('.fw-bonus');
    if (w && !w.disabled) guess(w.dataset.word);
    if (b && !b.disabled) bonus(b);
  });
  screen.addEventListener('mouseover', (e) => {
    const w = e.target.closest('.fw-word');
    screen.querySelectorAll('.fw-word.hover').forEach(x => x.classList.remove('hover'));
    if (w) screen.querySelectorAll(`.fw-word[data-word="${w.dataset.word}"]`).forEach(x => x.classList.add('hover'));
  });

  function disableWord(word, dots) {
    screen.querySelectorAll(`.fw-word[data-word="${word}"]`).forEach(x => { x.disabled = true; if (dots) x.textContent = '.'.repeat(x.textContent.length); });
  }

  function guess(word) {
    logLine(word);
    if (word === password) return end(true);
    disableWord(word);
    const likeness = [...word].filter((ch, i) => ch === password[i]).length;
    logLine('Entry denied.'); logLine(`Likeness=${likeness}`);
    attempts--; drawAttempts();
    if (attempts <= 0) end(false);
  }

  function bonus(btn) {
    btn.disabled = true;
    logLine(btn.textContent);
    const duds = [...new Set([...screen.querySelectorAll('.fw-word:not(:disabled)')].map(x => x.dataset.word))].filter(w => w !== password);
    if (Math.random() < 0.6 && duds.length) { disableWord(duds[Math.floor(Math.random() * duds.length)], true); logLine('Dud removed.'); }
    else { attempts = ATTEMPTS; drawAttempts(); logLine('Allowance replenished.'); }
  }

  function end(win) {
    locked = true;
    screen.classList.add(win ? 'win' : 'fail');
    if (win) { logLine('Exact match!'); logLine('ACCESS GRANTED.'); setTimeout(() => { closeWindow('firewall'); showPayload(); }, 1800); }
    else { logLine('TERMINAL LOCKED.'); logLine('Connection terminated.'); setTimeout(() => closeWindow('firewall'), 2500); }
  }

  const body = el('div', { class: 'fw' },
    el('div', { class: 'fw-header' }, 'ROBCO-ISH INDUSTRIES (TM) TERMLINK PROTOCOL', el('br'), 'ENTER PASSWORD NOW'),
    attemptsEl,
    el('div', { class: 'fw-main' }, screen, log));
  openWindow({ id: 'firewall', title: 'Bypass Security Protocol', icon: 'images/firewall_icon.png', body, width: 760, height: 520, x: 'center', y: 'center', className: 'term-window' });
  drawAttempts();
  logLine('Security layer detected.');
  logLine(`Password length: ${password.length}`);
}

function showPayload() {
  if (getWindow('payload')) return;
  const body = el('div', { class: 'payload' },
    el('h3', {}, 'Project Manifest [CONFIDENTIAL]'),
    el('p', {}, 'System breach successful. The following experimental tools and archives are now accessible.'),
    el('ul', {},
      el('li', {}, el('b', {}, 'Theme Engine: '), el('button', { onclick: () => {
        const on = !document.body.classList.contains('hacker-theme');
        document.body.classList.toggle('hacker-theme', on); store.set('nightmode', on ? 'on' : 'off');
      } }, "Toggle 'Nightmode'")),
      el('li', {}, el('b', {}, 'Kernel Debugger: '), el('button', { onclick: () => msgBox({ title: 'Kernel Debugger', icon: 'images/help_icon.png', text: 'Kernel is stable. No debug necessary.' }) }, 'Run Diagnostics')),
      el('li', {}, el('b', {}, 'Secret Archives: '), el('a', { href: 'https://archive.org/details/softwarelibrary_msdos_games', target: '_blank', rel: 'noopener' }, 'Access MS-DOS Game Library ↗'))));
  openWindow({ id: 'payload', title: 'Payload Decrypted', icon: 'images/key_icon.png', body, width: 440, x: 'center', y: 'center', mobile: 'dialog' });
}
