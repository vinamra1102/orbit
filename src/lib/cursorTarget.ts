// Shared mutable state for the custom cursor. Written by mousemove and by
// the in-canvas CursorProjector (which snaps to a hovered node's screen
// position); read by the rAF loop in Cursor.tsx. Deliberately not React
// state — every field mutates per frame or per mousemove and this avoids
// re-render thrash.
export const cursorTarget = {
  // Raw pointer position in viewport coords.
  mouseX: -100,
  mouseY: -100,
  // Projected screen position of the currently hovered node, if any.
  snapX: -100,
  snapY: -100,
  // Whether the pointer is inside the canvas element's bounds.
  overCanvas: false,
  // Whether the pointer is over a [data-cursor-hide] region (header,
  // side panel). Header uses pointer-events: none so we cannot detect it
  // via elementsFromPoint — a geometric bounding-rect check runs on every
  // mousemove instead.
  overChrome: false,
}
