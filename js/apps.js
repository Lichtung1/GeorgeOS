import { el, store, isTouch } from './util.js';
import { openWindow, closeWindow, getWindow, isMobile, setTitle } from './wm.js';
import { TEXT } from './data/content.js';
import { FOLDERS, PROJECTS } from './data/projects.js';
import { ART_FILES, PHOTO_FILES } from './data/files.js';

/* ═════════════════════════  DIALOGS  ═════════════════════════ */

/** Win98 message box. Returns a promise resolving to the clicked button label. */
export function msgBox({ title = 'GeorgeOS', text, html, icon = 'images/error_icon.png', buttons = ['OK'], id = 'msgbox-' + Math.random().toString(36).slice(2) }) {
  return new Promise((resolve) => {
    let result = null;
    const body = el('div', { class: 'msgbox' },
      el('div', { class: 'msgbox-main' },
        icon ? el('img', { src: icon, alt: '', width: 32, height: 32 }) : null,
        html ? el('div', { html }) : el('p', {}, text)),
      el('div', { class: 'msgbox-buttons' },
        buttons.map((b, i) => el('button', { onclick: () => { result = b; closeWindow(id); }, ...(i === 0 ? { 'data-default': '' } : {}) }, b))));
    openWindow({ id, title, body, width: 'auto', x: 'center', y: 'center', resizable: false, maximizable: false, mobile: 'dialog', className: 'dialog', onClose: () => resolve(result) });
    body.querySelector('[data-default]')?.focus();
  });
}

/* ═════════════════════════  NOTEPAD  ═════════════════════════ */

export function openText(key, opts = {}) {
  const doc = TEXT[key];
  if (!doc) return;
  const body = el('div', { class: 'notepad' },
    menuBar(['File', 'Edit', 'Search', 'Help']),
    el('pre', { class: 'notepad-text', tabindex: 0 }, doc.text));
  return openWindow({ id: 'txt-' + key, title: doc.title, icon: 'icons/doc.png', body, width: 560, height: 420, ...opts });
}

function menuBar(items) {
  return el('div', { class: 'menu-bar', role: 'menubar' }, items.map(i => el('span', { role: 'menuitem', html: `<u>${i[0]}</u>${i.slice(1)}` })));
}

/* ═════════════════════════  MEDIA VIEWER  ═════════════════════════ */
/**
 * Show an image/video from a list, with Previous/Next.
 * items: [{ src, name, kind: 'image'|'video', poster? }]
 */
export function openMedia(items, index = 0, groupId = 'viewer') {
  const id = 'media-' + groupId;
  let i = index;
  const stage = el('div', { class: 'media-stage' });
  const caption = el('div', { class: 'status-bar-field' });
  const counter = el('div', { class: 'status-bar-field' });
  const prev = el('button', { onclick: () => show(i - 1), 'aria-label': 'Previous' }, '◀ Back');
  const next = el('button', { onclick: () => show(i + 1), 'aria-label': 'Next' }, 'Next ▶');

  const body = el('div', { class: 'media-viewer', tabindex: 0,
      onkeydown: (e) => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); } },
    stage,
    items.length > 1 ? el('div', { class: 'media-nav' }, prev, next) : null,
    el('div', { class: 'status-bar' }, caption, counter));

  function show(n) {
    i = (n + items.length) % items.length;
    const it = items[i];
    stage.querySelectorAll('video').forEach(v => v.pause());
    stage.replaceChildren();
    if (it.kind === 'video') {
      const v = el('video', { src: it.src, controls: true, loop: true, playsinline: true, poster: it.poster, preload: 'metadata' });
      stage.append(v);
      // Try to autoplay with sound; browsers may refuse, so fall back to muted.
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    } else {
      stage.append(el('img', { src: it.src, alt: it.name }));
    }
    caption.textContent = it.name;
    counter.textContent = items.length > 1 ? `${i + 1} of ${items.length}` : (it.kind === 'video' ? 'Video' : 'Image');
    setTitle(id, it.name + ' - Viewer');
  }

  const existing = getWindow(id);
  if (existing) closeWindow(id);
  const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.85, 760);
  openWindow({ id, title: items[i].name + ' - Viewer', icon: items[i].kind === 'video' ? 'icons/video.png' : 'icons/image.png',
    body, width: size, height: size + 40, x: 'center', y: 'center', className: 'viewer-window' });
  show(i);
  body.focus({ preventScroll: true });
}

/* ═════════════════════════  EXPLORER  ═════════════════════════ */
/**
 * A Windows-Explorer-style window. `locations` is a function(path) -> {title, items}
 * items: [{ name, icon, thumb?, type, date?, size?, open: () => void | {path} }]
 */
function openExplorer({ id, rootPath, resolve, icon = 'images/folder.png', width = 640, height = 440, view = 'icons' }) {
  let path = rootPath;
  let mode = store.get('view-' + id) || view;
  const history = [];

  const address = el('input', { type: 'text', readonly: true, class: 'address' });
  const upBtn = el('button', { onclick: () => history.length && go(history.pop(), false), title: 'Up one level' }, el('span', { class: 'up-arrow', 'aria-hidden': 'true' }), 'Up');
  const viewBtns = el('div', { class: 'view-toggle' },
    el('button', { onclick: () => setMode('icons'), 'data-mode': 'icons' }, 'Large Icons'),
    el('button', { onclick: () => setMode('details'), 'data-mode': 'details' }, 'Details'));
  const list = el('div', { class: 'explorer-list sunken-panel', role: 'listbox' });
  const status = el('div', { class: 'status-bar-field' });

  const body = el('div', { class: 'explorer' },
    menuBar(['File', 'Edit', 'View', 'Go', 'Help']),
    el('div', { class: 'explorer-toolbar' }, upBtn, viewBtns),
    el('div', { class: 'address-row' }, el('label', {}, 'Address'), address),
    list,
    el('div', { class: 'status-bar' }, status));

  function setMode(m) { mode = m; store.set('view-' + id, m); render(); }

  function go(p, push = true) {
    if (push) history.push(path);
    path = p;
    render();
  }

  function render() {
    const loc = resolve(path);
    address.value = loc.address;
    setTitle(id, loc.title);
    upBtn.disabled = history.length === 0;
    viewBtns.querySelectorAll('button').forEach(b => b.classList.toggle('pressed', b.dataset.mode === mode));
    list.className = `explorer-list sunken-panel view-${mode}`;
    list.replaceChildren();

    const activate = (it) => { const r = it.open(); if (r && r.path) go(r.path); };

    if (mode === 'details') {
      const tbody = el('tbody');
      loc.items.forEach(it => {
        const row = el('tr', { tabindex: 0, ondblclick: () => activate(it), onkeydown: (e) => e.key === 'Enter' && activate(it) },
          el('td', {}, el('span', { class: 'cell-name' }, el('img', { src: it.icon, alt: '' }), it.name)),
          el('td', {}, it.year || ''), el('td', {}, it.type || ''), el('td', { class: 'num' }, it.size || ''));
        if (isTouch()) row.addEventListener('click', () => activate(it));
        else row.addEventListener('click', () => { tbody.querySelectorAll('.highlighted').forEach(r => r.classList.remove('highlighted')); row.classList.add('highlighted'); });
        tbody.append(row);
      });
      list.append(el('table', { class: 'interactive' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Name'), el('th', {}, 'Date'), el('th', {}, 'Type'), el('th', {}, 'Size'))), tbody));
    } else {
      loc.items.forEach(it => {
        const tile = el('button', { class: 'file-tile', title: it.name, ondblclick: () => activate(it), onkeydown: (e) => e.key === 'Enter' && activate(it) },
          it.thumb ? el('span', { class: 'thumb' }, el('img', { src: it.thumb, alt: '', loading: 'lazy' })) : el('img', { src: it.icon, alt: '', class: 'tile-icon' }),
          el('span', { class: 'tile-label' }, it.name));
        if (isTouch()) tile.addEventListener('click', () => activate(it));
        list.append(tile);
      });
    }
    status.textContent = `${loc.items.length} object(s)`;
  }

  openWindow({ id, title: resolve(path).title, icon, body, width, height });
  render();
}

/* ── My Work ── */
const projFile = (p) => p.file || p.title.replace(/[“”"']/g, '').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') + '.doc';
const projIcon = (p) => p.icon || FOLDERS.find(f => f.id === p.folder)?.icon || 'icons/doc.png';

export function openMyWork(folderId = null) {
  openExplorer({
    id: 'mywork', icon: 'images/briefcase.png', width: 680, height: 460,
    rootPath: folderId || '',
    resolve: (path) => {
      if (!path) return {
        title: 'My Work', address: 'C:\\My Work',
        items: FOLDERS.map(f => ({ name: f.name, icon: f.icon, type: 'File Folder',
          size: PROJECTS.filter(p => p.folder === f.id).length + ' items', open: () => ({ path: f.id }) })),
      };
      const f = FOLDERS.find(x => x.id === path);
      return {
        title: f.name, address: 'C:\\My Work\\' + f.name,
        items: PROJECTS.filter(p => p.folder === path).map(p => ({
          name: projFile(p), icon: projIcon(p), year: p.year, type: p.launch ? 'Application' : 'Project',
          open: () => openProject(p.id),
        })),
      };
    },
  });
}

/* ── Art & Photos ── */
const fileItems = (files) => files.map(f => ({ name: f.name, icon: f.kind === 'video' ? 'icons/video.png' : 'icons/image.png',
  thumb: f.thumb, year: f.date, type: f.type, size: f.size }));

export function openArtFolder() {
  const items = fileItems(ART_FILES);
  items.forEach((it, i) => it.open = () => openMedia(ART_FILES, i, 'art'));
  openExplorer({ id: 'art', rootPath: 'art', resolve: () => ({ title: 'Art', address: 'C:\\My Documents\\Art', items }) });
}

export function openPhotosFolder() {
  const items = fileItems(PHOTO_FILES);
  items.forEach((it, i) => it.open = () => openMedia(PHOTO_FILES, i, 'photos'));
  openExplorer({ id: 'photos', rootPath: 'photos', resolve: () => ({ title: 'Photos', address: 'C:\\My Documents\\Photos', items }) });
}

/* ═════════════════════════  PROJECT SHEET  ═════════════════════════ */

export function openProject(projectId) {
  const p = PROJECTS.find(x => x.id === projectId);
  if (!p) return;

  const media = (p.media || []);
  const viewable = media.filter(m => m.type === 'image' || m.type === 'video')
    .map(m => ({ src: m.src, name: m.caption || m.src.split('/').pop(), kind: m.type, poster: m.poster }));

  const meta = el('table', { class: 'project-meta' },
    p.year ? el('tr', {}, el('th', {}, 'Year'), el('td', {}, p.year)) : null,
    p.role ? el('tr', {}, el('th', {}, 'Role'), el('td', {}, p.role)) : null,
    p.with ? el('tr', {}, el('th', {}, 'With'), el('td', {}, p.with)) : null,
    p.tags ? el('tr', {}, el('th', {}, 'Tools'), el('td', {}, p.tags.join(' · '))) : null);

  const embeds = media.filter(m => m.type === 'youtube' || m.type === 'vimeo').map(m =>
    el('figure', { class: 'embed' },
      el('div', { class: 'embed-frame' }, el('iframe', {
        src: m.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${m.id}` : `https://player.vimeo.com/video/${m.id}`,
        title: m.caption || p.title, allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true, loading: 'lazy' })),
      m.caption ? el('figcaption', {}, m.caption) : null));

  const gallery = viewable.length ? el('fieldset', {},
    el('legend', {}, viewable.length > 1 ? `Media (${viewable.length})` : 'Media'),
    el('div', { class: 'gallery' }, viewable.map((m, i) =>
      el('button', { class: 'gallery-item', onclick: () => openMedia(viewable, i, p.id), title: m.name },
        el('img', { src: m.kind === 'video' ? (m.poster || 'icons/video.png') : m.src, alt: m.name, loading: 'lazy' }),
        m.kind === 'video' ? el('span', { class: 'play-badge' }, '▶') : null,
        el('span', { class: 'gallery-caption' }, m.name))))) : null;

  const actions = [
    p.launch && LAUNCHERS[p.launch] ? el('button', { class: 'default', onclick: () => openLauncher(p.launch) }, `▶ Run ${LAUNCHERS[p.launch].file}`) : null,
    ...(p.links || []).map(l => el('a', { class: 'button-link', href: l.url, target: '_blank', rel: 'noopener' }, l.label + ' ↗')),
  ].filter(Boolean);

  const body = el('div', { class: 'project' },
    el('div', { class: 'project-scroll' },
      el('header', { class: 'project-head' },
        el('img', { src: projIcon(p), alt: '', width: 32, height: 32 }),
        el('div', {}, el('h2', {}, p.title), el('div', { class: 'project-role' }, [p.year, p.role].filter(Boolean).join(' · ')))),
      meta,
      embeds,
      (p.body || []).map(t => el('p', {}, t)),
      p.bullets ? el('ul', {}, p.bullets.map(b => el('li', {}, b))) : null,
      gallery,
      actions.length ? el('div', { class: 'project-actions' }, actions) : null),
    el('div', { class: 'status-bar' },
      el('div', { class: 'status-bar-field' }, projFile(p)),
      el('div', { class: 'status-bar-field' }, FOLDERS.find(f => f.id === p.folder)?.name || '')));

  openWindow({ id: 'proj-' + p.id, title: p.title, icon: projIcon(p), body, width: 580, height: 520 });
}

/* ═════════════════════════  LAUNCHERS (live sites in a window)  ═════════════════════════ */

export const LAUNCHERS = {
  mmos:     { title: 'MOYAMOYA OS', file: 'MMOS.exe', icon: 'images/MMOS.png', url: 'https://moyamoya.ca', notes: 'mmos', w: 820, h: 600 },
  lichtung: { title: 'Where I Cannot Find Him', file: 'text_dissolution.exe', icon: 'images/job.png', url: 'https://lichtung1.github.io/Where-I-Cannot-Find-Him-V2/', notes: 'lichtung', w: 720, h: 520 },
  cep:      { title: 'CEP BBS', file: 'CEP.BAT', icon: 'images/brain.png', url: 'https://cep.moyamoya.ca', notes: 'cep', w: 720, h: 520 },
  moth:     { title: 'Luana Moth', file: 'Luana_Moth.exe', icon: 'images/moth.png', url: 'https://luanamoth.com', notes: 'moth', w: 820, h: 600 },
};

export function openLauncher(key) {
  const L = LAUNCHERS[key];
  const frame = el('iframe', { src: L.url, title: L.title, allow: 'autoplay; fullscreen' });
  const main = openWindow({ id: 'app-' + key, title: L.title, icon: L.icon, body: el('div', { class: 'iframe-wrap' }, frame), width: L.w, height: L.h, x: 'center', y: 'center' });

  const doc = TEXT[L.notes];
  const notes = el('div', { class: 'launcher-notes' },
    el('p', {}, doc.text),
    el('div', { class: 'msgbox-buttons' },
      el('a', { class: 'button-link', href: L.url, target: '_blank', rel: 'noopener' }, 'Open in new tab ↗'),
      el('button', { onclick: () => closeWindow('notes-' + key) }, 'Close')));
  const r = main.getBoundingClientRect();
  openWindow({ id: 'notes-' + key, title: doc.title, icon: 'icons/doc.png', body: notes, width: 360, x: r.left + 40, y: r.top + 60, mobile: 'dialog', maximizable: false });
}

/* ═════════════════════════  CV  ═════════════════════════ */

export const CVS = {
  artist:   { file: 'Artist_CV.pdf',   url: 'docs/George_Dyck_Artist_CV.pdf',   icon: 'icons/cv.png' },
  academic: { file: 'Academic_CV.pdf', url: 'docs/George_Dyck_Academic_CV.pdf', icon: 'icons/cv_academic.png' },
};

export function openCV(which = 'artist') {
  const cv = CVS[which];
  if (isMobile()) { window.open(cv.url, '_blank', 'noopener'); return; }
  const body = el('div', { class: 'cv' },
    el('div', { class: 'explorer-toolbar' },
      el('a', { class: 'button-link', href: cv.url, download: 'George_Dyck_' + cv.file }, 'Download'),
      el('a', { class: 'button-link', href: cv.url, target: '_blank', rel: 'noopener' }, 'Open in new tab ↗')),
    el('div', { class: 'iframe-wrap' }, el('iframe', { src: cv.url, title: 'George Dyck ' + cv.file })));
  openWindow({ id: 'cv-' + which, title: cv.file, icon: cv.icon, body, width: 720, height: 640, x: 'center', y: 20 });
}

/* ═════════════════════════  SETTINGS (Display Properties)  ═════════════════════════ */

export const WALLPAPERS = [
  { name: '(None)', src: '' },
  { name: 'Windows 95', src: 'images/win95.jpg' },
  { name: 'Windows XP', src: 'images/XP_GrassandSky.jpg' },
  { name: 'Jungle', src: 'images/jungle.jpg' },
  { name: 'Mystery', src: 'images/mystery.jpg' },
  { name: 'Science', src: 'images/science.jpg' },
  { name: 'Da Vinci', src: 'images/davinci.jpg' },
  { name: 'Space', src: 'images/space_wallpaper_small.png' },
];

export function applyWallpaper(src) {
  const d = document.getElementById('desktop');
  d.style.backgroundImage = src ? `url('${src}')` : '';
  d.classList.toggle('has-wallpaper', !!src);
}

export function openSettings() {
  const saved = store.get('wallpaper') || '';
  let choice = saved;
  const screen = el('div', { class: 'monitor-screen' });
  const preview = (src) => { screen.style.backgroundImage = src ? `url('${src}')` : ''; };
  preview(saved);
  // Win98-style list box (98.css turns every <select> into a one-row dropdown)
  const select = el('ul', { class: 'wallpaper-list', role: 'listbox', tabindex: 0, 'aria-label': 'Wallpaper' },
    WALLPAPERS.map(w => el('li', { role: 'option', 'data-src': w.src, 'aria-selected': String(w.src === saved) }, w.name)));
  const pick = (li) => {
    if (!li) return;
    select.querySelectorAll('li').forEach(o => o.setAttribute('aria-selected', String(o === li)));
    li.scrollIntoView({ block: 'nearest' });
    choice = li.dataset.src; preview(choice);
  };
  select.addEventListener('click', (e) => pick(e.target.closest('li')));
  select.addEventListener('dblclick', (e) => { if (e.target.closest('li')) { apply(); closeWindow('settings'); } });
  select.addEventListener('keydown', (e) => {
    const cur = select.querySelector('[aria-selected="true"]');
    if (e.key === 'ArrowDown') { e.preventDefault(); pick(cur ? cur.nextElementSibling || cur : select.firstElementChild); }
    if (e.key === 'ArrowUp') { e.preventDefault(); pick(cur ? cur.previousElementSibling || cur : select.firstElementChild); }
    if (e.key === 'Enter') { apply(); closeWindow('settings'); }
  });

  const apply = () => { store.set('wallpaper', choice); applyWallpaper(choice); };
  const body = el('div', { class: 'settings' },
    el('menu', { role: 'tablist' }, el('li', { role: 'tab', 'aria-selected': 'true' }, el('a', {}, 'Background'))),
    el('div', { class: 'window', role: 'tabpanel' }, el('div', { class: 'window-body' },
      el('div', { class: 'monitor' }, screen, el('div', { class: 'monitor-stand' })),
      el('fieldset', {}, el('legend', {}, 'Wallpaper'), el('p', {}, 'Select a background for your desktop:'), select))),
    el('div', { class: 'msgbox-buttons' },
      el('button', { onclick: () => { apply(); closeWindow('settings'); } }, 'OK'),
      el('button', { onclick: () => closeWindow('settings') }, 'Cancel'),
      el('button', { onclick: apply }, 'Apply')));
  openWindow({ id: 'settings', title: 'Display Properties', icon: 'images/settings.png', body, width: 400, x: 'center', y: 40, resizable: false, maximizable: false, mobile: 'dialog' });
}
