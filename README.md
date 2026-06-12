# Combat Pong

A 90-second duel for territory. Day versus night on one board.

Inspired by [Pong Wars](https://github.com/vnglst/pong-wars), with a paddle in your hand: balls flip every tile they touch on enemy ground, clean returns build a streak, and whoever holds more of the board when the clock runs out wins.

**[Play now → combatpong.com](https://www.combatpong.com)**

## How it plays

- The board starts split: your warm half below, the night above.
- Slam **your** amber ball to send it deeper and faster; meet the enemy ball to cushion it away. Offense and defense live in the same motion.
- Every clean return builds a streak that adds speed (and climbs the musical scale). A ball slipping past you only resets the streak — territory is the only score, so a miss never feels like death.
- Gifts glow on the frontier: claim one with your amber ball for a burst of captures, a wider paddle, or a whole row at once.
- After 90 seconds, whoever holds more tiles takes the duel.

Four modes (Calm, Classic, Quick, Chaos) change the number of balls, the tempo, and how sharp the night plays. The **Daily Duel** serves the same seeded board to everyone in the world each UTC day; only your first attempt counts, day streaks add up, and your result shares as an emoji mosaic of your actual final frontier:

```text
Combat Pong Daily #5 · 63% · 3-day streak

⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬛⬛🟨🟨🟨🟨⬛
🟨🟨🟨🟨🟨🟨🟨🟨
...
```

## Design

The whole game is tuned to be **satisfying and relaxing at once**:

- Two continuous masses of territory, no grid lines, an organic frontier with dawn light bleeding into the night. Ball tempo and frontier drama are calibrated against the original Pong Wars demo (~680 px/s, long diagonal carves).
- A fixed-timestep simulation (240 Hz) on a persistent accumulator, so the physics run at exactly the same pace on a 60 Hz laptop and a 144 Hz monitor.
- Squash-and-stretch on every bounce axis, speed-scaled hit-stop, slam returns, slow-motion starts, soft trails and capture blooms. Feel lives in the simulation, not in screen shake.
- On desktop, clicking the board captures your mouse (Pointer Lock), so the cursor can never leave the duel; Esc releases it and pauses.
- A generative soundscape on the D major pentatonic scale, panned in stereo by board column: captures are wind chimes, cascades become arpeggios, returns are warm plucks, and the last ten seconds sit on a quiet pad.

## Tech

| Layer | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite |
| Rendering | HTML5 canvas, device-pixel-snapped tiles |
| Audio | Web Audio API (no asset files) |
| Persistence | `localStorage` (no accounts, no backend) |
| Deployment | Vercel |

## Project structure

```text
src/
├── App.tsx                 # Tiny pathname router
├── index.css               # Design system
├── components/
│   ├── MainMenu.tsx        # Home — a live ambient board and one Play button
│   └── HowToPlay.tsx       # The rules, in four sentences
└── game/
    ├── engine.ts           # Pure simulation: physics, AI, streaks, events
    ├── render.ts           # Canvas renderer: territory, trails, blooms
    ├── audio.ts            # Generative pentatonic soundscape, stereo-panned
    ├── GameCanvas.tsx      # Match screen: rAF loop, input, HUD, overlays
    ├── ShareCard.ts        # Result cards drawn from your actual final board
    ├── daily.ts            # The Daily Duel: one shared seeded board per day
    ├── PlayerStats.ts      # Local career stats
    ├── modePref.ts         # Persisted mode selection
    ├── constants.ts        # The tuning surface
    └── types.ts            # Engine types
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

## License

[MIT](LICENSE)
