// tree-display.js — one place to decide how every taxonomic tree is drawn.
//
// Loaded from ui-auth.js, i.e. before any tree renders, and wraps
// Markmap.create so that per-call options still win: PvP passes its own colour
// function and Checklists colour nodes with tokens, and both are preserved.
//
// Why: markmap's default is one saturated d3 hue per *leaf*, which turns a
// 200-species tree into confetti and collides with PvP's red/blue semantics.
// Freezing the colour two levels down gives a handful of branch colours in the
// site's own palette, and a little more vertical room keeps the rank and photo
// badges from crowding the row below.
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

  var tries = 0;

  function install() {
    var MM = window.markmap && window.markmap.Markmap;
    if (!MM) {
      if (++tries < 80) setTimeout(install, 250);   // CDN scripts may still be landing
      return;
    }
    if (MM.__treeDisplay) return;
    MM.__treeDisplay = true;

    var create = MM.create;
    MM.create = function (svg, opts, data) {
      var merged = Object.assign({}, DEFAULTS, opts || {});
      if (!merged.color) merged.color = PALETTE.slice();
      return create.call(this, svg, merged, data);
    };
  }

  install();
})();
