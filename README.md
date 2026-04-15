# Combat Pong

Combat Pong is a territory-control arcade game inspired by [Pong Wars](https://github.com/vnglst/pong-wars), rebuilt around an **anonymous duel** fantasy.

There are no accounts, no Supabase dependencies, and no real multiplayer backend anymore. Instead, every match generates a simulated rival with its own alias, timing profile, and pressure pattern so the game still feels like a live 1v1 without queue friction.

**[Play now](https://www.combatpong.com)**

## Core loop

- The board starts split between your side and the rival side.
- Balls convert enemy tiles on impact.
- Clean paddle returns build a streak and make your touches more dangerous.
- The rival is simulated locally but tuned to feel reactive and human.
- After 90 seconds, whoever controls more territory wins the duel.

## What changed

- Removed all account, auth, matchmaking, storage, and realtime code.
- Rebuilt the main game loop around anonymous rival personas.
- Upgraded the board feel with cleaner rendering, better trails, impact rings, particles, and stronger HUD feedback.
- Moved player progression to a simple local-only stats model.
- Reworked sharing so it generates assets locally instead of uploading them.
- Updated UI copy and metadata so the product no longer claims real multiplayer.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + custom CSS variables |
| Rendering | HTML5 canvas + `requestAnimationFrame` |
| Persistence | `localStorage` |
| Deployment | Vercel |

## Project structure

```text
src/
├── App.tsx                     # Tiny pathname router + route rendering
├── index.css                   # Global theme, surface system, shared UI classes
├── components/
│   ├── MainMenu.tsx            # Anonymous duel lobby / mode selection
│   ├── SEOPages.tsx            # Mode landing pages + how-to-play
│   ├── MoreSEOPages.tsx        # FAQ, About, Tips, anonymous duel guide
│   ├── ExtendedSEOPages.tsx    # Mechanics guides
│   ├── AdditionalSEOPages.tsx  # History, updates, challenges, browser support
│   ├── TargetedSEOPages.tsx    # Audience-targeted landing pages
│   ├── MoreTargetedSEOPages.tsx
│   ├── FinalSEOPages.tsx
│   └── SEOFooter.tsx
├── game/
│   ├── GameCanvas.tsx          # Canvas shell, HUD, overlays, post-match flow
│   ├── GameLoop.ts             # Anonymous duel engine
│   ├── ShareCard.ts            # Local share card generation + share fallback
│   ├── PlayerStats.ts          # Local-only career stats
│   ├── rivals.ts               # Rival persona generation and feed helpers
│   ├── constants.ts            # Tuning surface for feel and visuals
│   └── types.ts                # Core engine types
└── main.tsx
```

## Development

### Requirements

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/slegarraga/combat-pong.git
cd combat-pong
npm install
```

No environment variables are required.

### Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Architecture notes

### Anonymous duel engine

`src/game/GameLoop.ts` owns the entire match:

1. Creates a rival persona for the selected difficulty.
2. Initializes the grid, paddles, and ball set.
3. Runs a frame loop that updates AI timing, collisions, tiles, streaks, and effects.
4. Emits a lightweight “live duel” feed and fluctuating signal/ping values.
5. Keeps React state updates focused on HUD values, while canvas rendering stays imperative.

### Rival simulation

`src/game/rivals.ts` generates:

- Rival aliases
- Rival titles and signatures
- Aggression / precision / wobble parameters
- Feed lines for opening pressure, lead changes, clutch moments, and resets

### Local-only progression

`src/game/PlayerStats.ts` stores:

- wins / losses
- best board percentage
- best streak
- best margin
- favorite difficulty
- last rival alias

Everything is stored in `localStorage`.

## Contributing

Good next directions:

- add opt-in audio feedback
- add new rival archetypes
- add alternate board themes
- add daily challenge rulesets
- add accessibility presets for motion and contrast

## Credits

- Inspired by [Pong Wars](https://github.com/vnglst/pong-wars) by Koen van Gilst
- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [Tailwind CSS](https://tailwindcss.com)

## License

[MIT](LICENSE)
