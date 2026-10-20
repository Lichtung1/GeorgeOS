import { el, store, isTouch } from './util.js';
import { openWindow, closeAll, isMobile } from './wm.js';
import { openText, openMyWork, openArtFolder, openPhotosFolder, openSettings, openCV, openLauncher, openProject, msgBox, applyWallpaper } from './apps.js';
import { openHelp, openRun, openFind, startFirewall, applyFlags } from './puzzles.js';
import { FOLDERS, PROJECTS } from './data/projects.js';

/* ── Desktop icons ── (order = order on screen) */
const ICONS = [
  { id: 'mywork',   label: 'My Work',              icon: 'images/briefcase.png',        open: () => openMyWork() },
  { id: 'operator', label: 'OPERATOR.LOG',         icon: 'images/operator_log_icon.png', open: () => openText('operatorLog') },
  { id: 'cv',       label: 'Artist_CV.pdf',        icon: 'icons/cv.png',                open: () => openCV('artist') },
  { id: 'cv-acad',  label: 'Academic_CV.pdf',      icon: 'icons/cv_academic.png',       open: () => openCV('academic') },
  { id: 'mmos',     label: 'MMOS.exe',             icon: 'images/MMOS.png',             open: () => openLauncher('mmos') },
  { id: 'cep',      label: 'CEP.BAT',              icon: 'images/brain.png',            open: () => openLauncher('cep') },
  { id: 'lichtung', label: 'text_dissolution.exe', icon: 'images/job.png',              open: () => openLauncher('lichtung') },
  { id: 'moth',     label: 'Luana_Moth.exe',       icon: 'images/moth.png',             open: () => openLauncher('moth') },
  { id: 'art',      label: 'Art',                  icon: 'images/folder.png',           open: () => openArtFolder() },
  { id: 'photos',   label: 'Photos',               icon: 'images/folder.png',           open: () => openPhotosFolder() },
  { id: 'help',     label: 'Help',                 icon: 'images/help_icon.png',        open: () => openHelp() },
  { id: 'settings', label: 'Settings',             icon: 'images/settings.png',         open: () => openSettings() },
  { id: 'firewall', label: 'Firewall.exe',         icon: 'images/firewall_icon.png',    open: () => startFirewall(), hidden: true },
];

function buildIcons(desktop) {
  const grid = el('div', { class: 'icon-grid' });
  for (const ic of ICONS) {
    const btn = el('button', { class: 'desktop-icon', id: 'icon-' + ic.id, hidden: ic.hidden },
      el('img', { src: ic.icon, alt: '' }), el('span', {}, ic.label));
    // Desktop: click selects, double-click opens. Touch: a tap opens.
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isTouch()) return ic.open();
      grid.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
      btn.classList.add('selected');
    });
    btn.addEventListener('dblclick', ic.open);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter') ic.open(); });
    grid.append(btn);
  }
  desktop.append(grid);
  desktop.addEventListener('click', (e) => { if (e.target === desktop || e.target === grid) grid.querySelectorAll('.selected').forEach(s => s.classList.remove('selected')); });
}

/* ── Start menu ── */
function buildStartMenu() {
  const item = (icon, label, action, sub) => el('li', { role: 'menuitem', class: sub ? 'has-sub' : '', tabindex: -1,
      onclick: sub ? null : (e) => { e.stopPropagation(); closeStart(); action(); } },
    el('img', { src: icon, alt: '' }), el('span', { html: label }), sub ? el('span', { class: 'arrow' }, '▶') : null,
    sub ? el('ul', { class: 'submenu', role: 'menu' }, sub) : null);
  const sep = () => el('li', { class: 'sep', role: 'separator' });

  const workSub = FOLDERS.map(f => item(f.icon, f.name, null,
    PROJECTS.filter(p => p.folder === f.id).map(p => item(p.icon || f.icon, p.title, () => openProject(p.id)))));
  workSub.unshift(item('images/briefcase.png', 'Open My Work folder', () => openMyWork()), sep());

  const menu = el('div', { id: 'start-menu', role: 'menu', hidden: true },
    el('div', { class: 'start-banner' }, el('b', {}, 'George'), 'OS'),
    el('ul', {},
      item('icons/cube.png', '<u>M</u>y Work', null, workSub),
      item('images/programs_icon.png', '<u>P</u>rograms', null, [
        item('images/MMOS.png', 'MMOS.exe', () => openLauncher('mmos')),
        item('images/brain.png', 'CEP.BAT', () => openLauncher('cep')),
        item('images/job.png', 'text_dissolution.exe', () => openLauncher('lichtung')),
        item('images/moth.png', 'Luana_Moth.exe', () => openLauncher('moth')),
      ]),
      item('images/documents_icon.png', '<u>D</u>ocuments', null, [
        item('images/operator_log_icon.png', 'OPERATOR.LOG', () => openText('operatorLog')),
        item('icons/cv.png', 'Artist_CV.pdf', () => openCV('artist')),
        item('icons/cv_academic.png', 'Academic_CV.pdf', () => openCV('academic')),
        item('icons/doc.png', 'Welcome.txt', () => openText('welcome')),
        item('images/folder.png', 'Art', () => openArtFolder()),
        item('images/folder.png', 'Photos', () => openPhotosFolder()),
      ]),
      item('images/settings_icon.png', '<u>S</u>ettings', () => openSettings()),
      item('images/find_icon.png', '<u>F</u>ind', () => openFind()),
      item('images/help_icon.png', '<u>H</u>elp', () => openHelp()),
      item('images/run_icon.png', '<u>R</u>un...', () => openRun()),
      sep(),
      item('images/shutdown_icon.png', 'Sh<u>u</u>t Down...', () => shutdown()),
    ));

  // Submenus: hover on desktop, tap-to-toggle on touch.
  menu.querySelectorAll('.has-sub').forEach(li => {
    li.addEventListener('mouseenter', () => { if (!isTouch()) openSub(li); });
    li.addEventListener('click', (e) => {
      if (e.target.closest('li') !== li) return;
      e.stopPropagation();
      li.classList.contains('open') ? li.classList.remove('open') : openSub(li);
    });
  });
  function openSub(li) {
    li.parentElement.querySelectorAll(':scope > .has-sub.open').forEach(o => o !== li && o.classList.remove('open'));
    li.classList.add('open');
    // keep submenus on screen
    const sub = li.querySelector(':scope > .submenu');
    sub.style.top = ''; sub.classList.remove('flip');
    const r = sub.getBoundingClientRect();
    if (r.bottom > innerHeight - 30) sub.style.top = `${Math.max(-li.offsetTop, innerHeight - 30 - r.bottom)}px`;
    if (r.right > innerWidth) sub.classList.add('flip');
  }
  menu.querySelectorAll(':scope > ul > li:not(.has-sub)').forEach(li => li.addEventListener('mouseenter', () => menu.querySelectorAll('.open').forEach(o => o.classList.remove('open'))));
  return menu;
}

let startMenu, startBtn;
function toggleStart(force) {
  const show = force ?? startMenu.hidden;
  startMenu.hidden = !show;
  startBtn.classList.toggle('active', show);
  if (!show) startMenu.querySelectorAll('.open').forEach(o => o.classList.remove('open'));
}
const closeStart = () => toggleStart(false);

/* ── Shutdown ── */
async function shutdown() {
  const answer = await msgBox({ id: 'shutdown', title: 'Shut Down GeorgeOS', icon: 'images/shutdown_icon.png', text: 'Are you sure you want to shut down?', buttons: ['Yes', 'No'] });
  if (answer !== 'Yes') return;
  closeAll();
  const overlay = el('div', { id: 'shutdown-overlay' }, el('p', {}, 'GeorgeOS is shutting down...'));
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  setTimeout(() => {
    overlay.replaceChildren(el('p', { class: 'safe-off' }, 'It is now safe to turn off your computer.'),
      el('button', { class: 'power-on', onclick: () => location.reload() }, 'Restart'));
  }, 1800);
}

/* ── Boot ── */
export function boot() {
  const desktop = document.getElementById('desktop');
  buildIcons(desktop);

  startMenu = buildStartMenu();
  document.body.append(startMenu);
  startBtn = document.getElementById('start-button');
  startBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleStart(); });
  document.addEventListener('click', (e) => { if (!startMenu.hidden && !startMenu.contains(e.target)) closeStart(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeStart(); });

  const clock = document.getElementById('clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 10_000);

  applyWallpaper(store.get('wallpaper') || '');
  applyFlags();

  // Welcome windows
  if (isMobile()) { openText('welcome'); return; }
  const r = desktop.getBoundingClientRect();
  openText('welcome', { width: 440, height: 330, x: r.width / 2 - 470, y: 40 });
  openWindow({ id: 'operator-photo', title: 'Operator', icon: 'icons/image.png', resizable: false,
    body: el('img', { src: 'images/ME.png', alt: 'Portrait of George Dyck', class: 'operator-photo' }),
    width: 320, x: r.width / 2 + 10, y: 70 });
}
