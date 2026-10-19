// tree-display.js — one place to decide how every taxonomic tree is drawn.
//
// Two jobs.
//
// 1. Colour and spacing defaults, merged *under* whatever the caller passes, so
//    PvP's red/blue colour function and Checklists' seen/unseen tokens still win.
//    Why: markmap's default is one saturated d3 hue per leaf, which turns a
//    200-species tree into confetti and collides with PvP's semantics. Freezing
//    the colour two levels down gives a handful of branch colours in the site's
//    own palette, and a little more vertical room keeps the rank and photo
//    badges from crowding the row below.
//
// 2. A compatibility shim. The app builds bare markmap nodes ({content,
//    children...}) and hands them to Markmap.create() as its `data` argument.
//    markmap-view 0.18 reads `data.root`, so a bare node lands as state.data =
//    undefined and the canvas comes back blank with no error at all — silent.
//    That is exactly what the live site did on 2026-10-19 (confirmed: the call
//    arrived with content = '<a class="taxon-link" ...>' and state.data = false).
//    Wrap bare nodes as {root: node} on the way through.
(function () {
  'use strict';

  var DEFAULTS = {
    colorFreezeLevel: 2,
    spacingVertical: 9,
    spacingHorizontal: 88,
    paddingX: 14
  };

  // Deep green → verdigris → olive → ochre (roughly the site's palette).
  var PALETTE = ['#1f5136', '#2f6f66', '#4a7f4f', '#7b8f3a', '#a5812f', '#8a5a2b', '#6b5b95'];

  // markmap 0.18 wants {root: node}. Bare nodes and markdown strings are what
  // the app actually produces, so normalise here rather than in five call sites.
  function asRoot(data) {
    if (!data || typeof data !== 'object') return data;       // markdown string
    if (data.root) return data;                               // already a wrapper
    if (data.content == null && !data.children) return data;  // nothing to wrap
    return { root: data };
  }

  var tries = 0;

  function install() {
    var MM = window.markmap && window.markmap.Markmap;
    if (!MM) {
      if (++tries < 80) setTimeout(install, 250);  // CDN scripts may still be landing
      return;
    }
    if (MM.__treeDisplay) return;
    MM.__treeDisplay = true;

    var create = MM.create;
    MM.create = function (svg, opts, data) {
      var merged = Object.assign({}, DEFAULTS, opts || {});
      if (!merged.color) merged.color = PALETTE.slice();
      return create.call(this, svg, merged, asRoot(data));
    };
  }

  install();
})();
