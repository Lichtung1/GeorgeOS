// ──────────────────────────────────────────────────────────────
//  Window manager. Windows are styled by 98.css (.window / .title-bar
//  / .window-body). This file handles open/focus/drag/resize/
//  minimize/maximize/close and the taskbar buttons.
// ──────────────────────────────────────────────────────────────
import { el } from './util.js';

const desktop = () => document.getElementById('desktop');
const taskbarButtons = () => document.getElementById('taskbar-buttons');

const windows = new Map();          // id -> { el, button, opts }
let zTop = 100;
let cascade = 0;

export const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/**
 * Open (or focus) a window.
 * @param {object} o
 *   id, title, icon, body (Node | string html),
 *   width, height ('auto' allowed), x, y ('center' allowed),
 *   resizable=true, maximizable=true, className, onClose, mobile ('full'|'dialog')
 * @returns {HTMLElement} the .window element
 */
export function openWindow(o) {
  if (windows.has(o.id)) {
    const w = windows.get(o.id);
    restore(o.id);
    return w.el;
  }

  const win = el('div', { class: `window ${o.className || ''}`, id: `win-${o.id}`, role: 'dialog', 'aria-label': o.title });
  const titleBar = el('div', { class: 'title-bar' },
    el('div', { class: 'title-bar-text' },
      o.icon ? el('img', { src: o.icon, alt: '', class: 'title-icon' }) : null,
      el('span', {}, o.title)),
    el('div', { class: 'title-bar-controls' },
      el('button', { 'aria-label': 'Minimize', onclick: () => minimize(o.id) }),
      o.maximizable !== false ? el('button', { 'aria-label': 'Maximize', class: 'max-btn', onclick: () => toggleMaximize(o.id) }) : null,
      el('button', { 'aria-label': 'Close', onclick: () => closeWindow(o.id) }),
    ));
  const body = el('div', { class: 'window-body' });
  if (o.body instanceof Node) body.append(o.body);
  else if (typeof o.body === 'string') body.innerHTML = o.body;
  win.append(titleBar, body);
  if (o.resizable !== false) win.append(el('div', { class: 'resize-handle', 'aria-hidden': 'true' }));

  desktop().append(win);
  const button = el('button', { class: 'taskbar-button', onclick: () => onTaskbarClick(o.id) },
    o.icon ? el('img', { src: o.icon, alt: '' }) : null, el('span', {}, o.title));
  taskbarButtons().append(button);

  windows.set(o.id, { el: win, button, opts: o });
  place(win, o);
  makeDraggable(win, titleBar, o.id);
  if (o.resizable !== false) makeResizable(win, win.querySelector('.resize-handle'));
  if (o.maximizable !== false) titleBar.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) toggleMaximize(o.id); });
  win.addEventListener('pointerdown', () => focus(o.id), true);

  focus(o.id);
  return win;
}

function place(win, o) {
  const d = desktop().getBoundingClientRect();
  if (isMobile()) {
    win.classList.add(o.mobile === 'dialog' ? 'mobile-dialog' : 'mobile-full');
    if (o.mobile === 'dialog') {
      win.style.width = 'calc(100% - 24px)';
      win.style.left = '12px';
      win.style.top = Math.max(12, (d.height - win.offsetHeight) / 3) + 'px';
    }
    return;
  }
  const W = Math.min(o.width ?? 520, d.width - 20);
  win.style.width = W === 'auto' ? 'auto' : W + 'px';
  if (o.height && o.height !== 'auto') win.style.height = Math.min(o.height, d.height - 20) + 'px';

  const ww = win.offsetWidth, wh = win.offsetHeight;
  let x = o.x, y = o.y;
  if (x === undefined || y === undefined) {
    x = 190 + (cascade % 8) * 28;
    y = 30 + (cascade % 8) * 28;
    cascade++;
  }
  if (x === 'center') x = (d.width - ww) / 2;
  if (y === 'center') y = (d.height - wh) / 2;
  win.style.left = clamp(x, 0, Math.max(0, d.width - ww)) + 'px';
  win.style.top = clamp(y, 0, Math.max(0, d.height - wh)) + 'px';
}

export function focus(id) {
  const w = windows.get(id);
  if (!w) return;
  for (const [, other] of windows) {
    other.el.classList.toggle('inactive', other !== w);
    other.el.querySelector('.title-bar').classList.toggle('inactive', other !== w);
    other.button.classList.toggle('active', other === w && !other.el.hidden);
  }
  w.el.style.zIndex = ++zTop;
}

export function minimize(id) {
  const w = windows.get(id);
  if (!w) return;
  w.el.hidden = true;
  w.button.classList.remove('active');
  focusTopmost();
}

export function restore(id) {
  const w = windows.get(id);
  if (!w) return;
  w.el.hidden = false;
  focus(id);
}

export function toggleMaximize(id) {
  const w = windows.get(id);
  if (!w) return;
  const max = w.el.classList.toggle('maximized');
  const btn = w.el.querySelector('.max-btn');
  if (btn) btn.setAttribute('aria-label', max ? 'Restore' : 'Maximize');
}

export function closeWindow(id) {
  const w = windows.get(id);
  if (!w) return;
  w.el.querySelectorAll('video, audio').forEach(m => m.pause());
  w.el.remove();
  w.button.remove();
  windows.delete(id);
  w.opts.onClose?.();
  focusTopmost();
}

export function setTitle(id, title) {
  const w = windows.get(id);
  if (!w) return;
  w.el.querySelector('.title-bar-text span').textContent = title;
  w.button.querySelector('span').textContent = title;
  w.el.setAttribute('aria-label', title);
}

export function closeAll() { [...windows.keys()].forEach(closeWindow); }
export const getWindow = (id) => windows.get(id)?.el ?? null;
export const openWindowIds = () => [...windows.keys()];

function focusTopmost() {
  const visible = [...windows.entries()].filter(([, w]) => !w.el.hidden)
    .sort((a, b) => (+b[1].el.style.zIndex) - (+a[1].el.style.zIndex));
  if (visible.length) focus(visible[0][0]);
}

function onTaskbarClick(id) {
  const w = windows.get(id);
  if (w.el.hidden) restore(id);
  else if (w.button.classList.contains('active')) minimize(id);
  else focus(id);
}

// Pointer events cover mouse, touch and pen in one code path; listeners
// are attached on drag start and removed on drag end (no global leaks).
function makeDraggable(win, handle, id) {
  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button') || win.classList.contains('maximized') || isMobile()) return;
    e.preventDefault();
    focus(id);
    const d = desktop().getBoundingClientRect();
    const ox = e.clientX - win.offsetLeft, oy = e.clientY - win.offsetTop;
    const move = (ev) => {
      win.style.left = clamp(ev.clientX - ox, -win.offsetWidth + 80, d.width - 80) + 'px';
      win.style.top = clamp(ev.clientY - oy, 0, d.height - 24) + 'px';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); document.body.classList.remove('dragging'); };
    document.body.classList.add('dragging');
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
}

function makeResizable(win, handle) {
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, sw = win.offsetWidth, sh = win.offsetHeight;
    const move = (ev) => {
      win.style.width = Math.max(220, sw + ev.clientX - sx) + 'px';
      win.style.height = Math.max(120, sh + ev.clientY - sy) + 'px';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); document.body.classList.remove('resizing'); };
    document.body.classList.add('resizing');
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
