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
2. **Hardware interaction — ready for review.** Hinge/viewpoint animation,
   D-pad feedback, keyboard highlighting, and Circle Pad tracking/scrolling.
   Icons can be highlighted but do not open sections yet. HOME behavior is
   reserved for checkpoint 3; face buttons, SELECT, START, POWER, and the 3D
   slider remain decorative.
3. **Navigation.** Section activation, HOME, scrolling, transitions, and photo browsing.
4. **Content.** Complete all six sections and finish responsive/accessibility checks.

Suggested checkpoint 2 commit:

```text
feat: animate the console and add keyboard and circle pad controls
```

## Dependencies by checkpoint

- Installed for checkpoint 1: `three@0.180.0`, `@react-three/fiber@9.3.0`,
  `@react-three/drei@10.7.6`. React and React DOM remain pinned to the existing
  `19.1.1` release for compatibility. Existing packages are retained.
- Installed for checkpoint 2: `motion` for coordinated animation.
- Checkpoint 3: add `embla-carousel-react` for the photo carousel.

No additional installation is needed after `npm ci` for the current checkpoint.
Future dependency changes will be committed with the checkpoint that uses them.

## Source structure

- `src/App.jsx`: application entry, lazy scene loading, and HTML fallback.
- `src/components/console/ConsoleScene.jsx`: separate base and lid geometry,
  lighting, responsive framing, and HTML screen surfaces.
- `src/components/console/Screens.jsx`: introduction, menu highlighting, and development scroll demo.
- `src/components/console/useConsoleControls.js`: animation state, keyboard input,
  Circle Pad tracking, scroll loop, and interruption cleanup.
- `src/components/console/controlMath.js`: menu movement and bounded pad/scroll calculations.
- `src/index.css`: screen styling and responsive typography.

The previous section components and their assets are preserved as content
sources for the later checkpoints. They are not mounted in the visual draft.

## Try checkpoint 2

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
- Open `/?scroll-demo=1` on the development server to load temporary scrolling
  content in the top screen. The normal introduction fits without scrolling.
  This demo is disabled in production.

`npm test` checks navigation boundaries, key mapping, pad limits, and scroll speed.
`npm run build` checks the production bundle. Browser review additionally covers
physical controls, animation reversal, hidden-screen focus, and responsive layouts.
