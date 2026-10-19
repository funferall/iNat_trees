/**
 * hallway-3d.js — retired 2026-10-19.
 *
 * The 3D Hallway view is gone: it went unused, and it pulled ~105 KB of
 * Three.js code (plus an import map) into every page load. This file is kept
 * only so the existing `<script src="hallway-3d.js">` tag in index.html keeps
 * resolving; it prunes the orphaned nav tab and pane so the view cannot open.
 *
 * The pane markup itself still sits in index.html — strip it when that file is
 * next revised wholesale. Nothing else depends on it: tab-controller.js just
 * toggles a body class and dispatches a `hallway:tabchange` event.
 */
document.getElementById('hallwayPane-tab')?.closest('li')?.remove();
document.getElementById('hallwayPane')?.remove();
document.getElementById('hallwayScene')?.remove();
