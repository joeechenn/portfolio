# Joe Chen’s Portfolio

A personal portfolio inspired by the black Nintendo 3DS I grew up playing.
Built with React, Vite, Tailwind, and a Three.js console with real HTML screens.

## Run locally

```sh
npm ci
npm run dev
```

Use the local URL printed by Vite. `npm run build` creates the production site
in `dist/`. The existing GitHub Pages base path remains `/portfolio/`.

## Review checkpoints

Each checkpoint is implemented, reviewed, and committed separately. Joe makes
the commits and explicitly starts the next checkpoint. Nothing is pushed or
deployed automatically.

1. **Visual draft — accepted.** Static open shell, introduction, six
   labeled tiles, light blue hover/selection preview, responsive framing, and a
   flat HTML fallback.
2. **Hardware interaction — accepted.** Hinge/viewpoint animation,
   D-pad feedback, keyboard highlighting, and Circle Pad tracking/scrolling.
   Face buttons, SELECT, START, POWER, and the 3D slider remain decorative.
3. **Navigation — ready for review.** Six placeholder sections, click/Enter activation,
   HOME, independent content scrolling, a persistent menu, and photo browsing.
4. **Content.** Complete all six sections and finish responsive/accessibility checks.

Suggested checkpoint 3 commit:

```text
feat: connect portfolio sections and photo browsing to the home menu
```

## Dependencies by checkpoint

- Installed for checkpoint 1: `three@0.180.0`, `@react-three/fiber@9.3.0`,
  `@react-three/drei@10.7.6`. React and React DOM remain pinned to the existing
  `19.1.1` release for compatibility. Existing packages are retained.
- Installed for checkpoint 2: `motion` for coordinated animation.
- Installed for checkpoint 3: `embla-carousel-react@8.6.0` for the photo carousel.

No additional installation is needed after `npm ci` for the current checkpoint.
Future dependency changes will be committed with the checkpoint that uses them.

## Source structure

- `src/App.jsx`: application entry, lazy scene loading, and HTML fallback.
- `src/components/console/ConsoleScene.jsx`: separate base and lid geometry,
  lighting, responsive framing, and HTML screen surfaces.
- `src/components/console/Screens.jsx`: introduction, persistent menu, and the upper-screen content viewport.
- `src/components/console/useConsoleControls.js`: animation state, keyboard input,
  Circle Pad tracking, scroll loop, and interruption cleanup.
- `src/components/console/software.js`: stable section identifiers and menu icons.
- `src/components/console/sections/`: placeholder panels and the picture carousel.
- `public/draft-gallery/`: four local SVG placeholders with different aspect ratios.
- `src/components/console/controlMath.js`: menu movement and bounded pad/scroll calculations.
- `src/index.css`: screen styling and responsive typography.

The previous section components and their assets are preserved as content
sources for the later checkpoints. They are not mounted in the console. Final content migration and removal of obsolete code remain in checkpoint 4.

## Try checkpoint 3

- Click the upper casing to close the console; click the closed lid to reopen it.
  The small Open/Close console button provides the same action by keyboard.
- WASD or arrow keys move the menu highlight. Clicking the D-pad does the same.
- Move the mouse over either screen to see the Circle Pad respond relative to
  that screen’s center. Hovering never scrolls content.
- Drag the Circle Pad up/down to scroll the top screen; releasing stops it.
  Keyboard users can focus the pad and hold up/down. Top-screen focus preserves
  normal scrolling instead of moving the menu selection.
- Holding up/down arrows with the top screen focused also depresses the matching
  D-pad direction; releasing the key returns it to neutral.
- Click an icon or focus it and press Enter to open that section. A short fade
  introduces the panel; reduced motion skips it. The new section starts at the top
  and receives focus so arrow keys scroll its content.
- The blue outline tracks menu highlighting. The open section also has a pale blue
  background and underlined label, even while another icon is highlighted.
- HOME returns to the introduction. Closing and reopening does the same.
- Pictures supports neighboring-photo clicks, arrow buttons, horizontal dragging /
  touch swiping, and left/right keys while its gallery is focused. It stops at both
  ends and remembers the selected picture across section changes.
- All section text and gallery images are placeholders for this checkpoint. Each
  text section is intentionally long enough to exercise scrolling. The old
  development-only scroll demo is removed; scrolling now works in real sections.
- The flat two-panel fallback uses the same sections, menu, HOME, and carousel.

`npm test` checks navigation boundaries, key mapping, pad limits, and scroll speed.
`npm run build` checks the production bundle. Browser review additionally covers
physical controls, animation reversal, hidden-screen focus, and responsive layouts.

Checkpoint 3 checks: all six section activations, menu highlighting without activation,
Enter, HOME, section scroll reset, native scrolling, Circle Pad dragging, gallery
neighbors/keyboard/endpoints/selection retention, and closed-screen accessibility.
Responsive browser checks cover 390px and 320px layouts. Real-device touch and final
cross-browser/content checks remain part of checkpoint 4 review.
