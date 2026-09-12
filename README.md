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

1. **Visual draft — ready for review.** Static open shell, introduction, six
   labeled tiles, light blue hover/selection preview, responsive framing, and a
   flat HTML fallback. Icons and hardware intentionally do not activate yet;
   the landing instructions preview the eventual controls.
2. **Hardware interaction.** Hinge/camera animation, D-pad feedback, keyboard
   highlighting, and Circle Pad tracking/scrolling.
3. **Navigation.** Section activation, HOME, scrolling, transitions, and photo browsing.
4. **Content.** Complete all six sections and finish responsive/accessibility checks.

Suggested first commit:

```text
feat: establish the black 3DS portfolio shell and home menu
```

## Dependencies by checkpoint

- Installed for checkpoint 1: `three@0.180.0`, `@react-three/fiber@9.3.0`,
  `@react-three/drei@10.7.6`. React and React DOM remain pinned to the existing
  `19.1.1` release for compatibility. Existing packages are retained.
- Checkpoint 2: add `motion` for coordinated animation.
- Checkpoint 3: add `embla-carousel-react` for the photo carousel.

No additional installation is needed after `npm ci` for the current checkpoint.
Future dependency changes will be committed with the checkpoint that uses them.

## Source structure

- `src/App.jsx`: application entry, lazy scene loading, and HTML fallback.
- `src/components/console/ConsoleScene.jsx`: separate base and lid geometry,
  lighting, responsive framing, and HTML screen surfaces.
- `src/components/console/Screens.jsx`: introduction and six static menu tiles.
- `src/index.css`: screen styling and responsive typography.

The previous section components and their assets are preserved as content
sources for the later checkpoints. They are not mounted in the visual draft.
