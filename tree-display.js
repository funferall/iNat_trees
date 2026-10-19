// tree-display.js — one place to decide how every taxonomic tree is drawn.
//
// 1. Colour function and spacing defaults, merged *under* whatever the caller
// passes, so PvP's red/blue colours and Checklists' seen/unseen tokens still
// win. Reason: markmap's default is one saturated d3 hue per leaf, which turns
// a 200-species tree into confetti and collides with PvP's semantics. Freezing
// colour two levels down gives a handful of branch colours in the site palette.
//
// 2. A guard on the data and options going into Markmap.create().
//
// What actually broke on 2026-10-19: this file used to set
// `merged.color = PALETTE.slice()`, an ARRAY. markmap-view 0.18 does
// `color(item)` inside _initializeData(), so an array threw a TypeError, which
// meant state.data was never assigned, which meant renderData() returned early
// — a 55-byte <svg> and no error in the console. Silent blank canvas. That was
// the whole bug; the CDN version pins were a red herring and both 0.18.10 and
// 0.18.12 render fine.
//
// The same file also used to wrap bare nodes as {root: node}. Wrong for 0.18:
// Markmap.create(svg, opts, data) takes a *bare* node (IPureNode) and passes it
// straight to setData(). The {root} wrapper made a node whose content was
// undefined, which threw again in the same place. Data now goes through
// untouched, exactly as the app builds it.
(function () {
'use strict';

var DEFAULTS = {
spacingVertical: 9,
spacingHorizontal: 88,
paddingX: 14
};

// Deep green -> verdigris -> olive -> ochre, roughly the site's palette.
var PALETTE = ['#1f5136', '#2f6f66', '#4a7f4f', '#7b8f3a', '#a5812f', '#8a5a2b', '#6b5b95'];

function hash(s) {
var h = 0;
for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
return Math.abs(h);
}

// Freeze colour two levels below the root, so a whole genus branch shares one
// colour and the tree reads as branches rather than confetti.
function frozenColor(node) {
var path = (node && node.state && node.state.path) || '';
var branch = path.split('.').slice(0, 3).join('.');
return PALETTE[hash(branch) % PALETTE.length];
}

// Accept: bare node (what the app builds), array colour (index by depth), or
// nothing at all. Anything else falls back to the frozen default.
function normalizeColor(c, depth) {
if (typeof c === 'function') return c(node); // not reached; see install()
return PALETTE[0];
}

var tries = 0;

function install() {
var MM = window.markmap && window.markmap.Markmap;
if (!MM) {
if (++tries < 80) setTimeout(install, 250); // CDN scripts may still be landing
return;
}
if (MM.__treeDisplay) return;
MM.__treeDisplay = true;

var create = MM.create;

MM.create = function (svg, opts, data) {
var merged = Object.assign({}, DEFAULTS, opts || {});
var c = merged.color;

if (typeof c === 'function') {
// Caller knows what it is doing (PvP red/blue, Checklists seen/unseen).
} else if (Array.isArray(c) && c.length) {
var palette = c.slice();
merged.color = function (node) {
var depth = (node && node.state && node.state.depth) || 1;
return palette[Math.min(depth - 1, palette.length - 1)];
};
} else {
merged.color = frozenColor; // always a function
}

return create.call(this, svg, merged, data);
};
}

install();
})();
