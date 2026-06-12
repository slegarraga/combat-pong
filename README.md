# Combat Pong

A 90-second duel for territory. Day versus night on one board.

Inspired by [Pong Wars](https://github.com/vnglst/pong-wars), with a paddle in your hand: balls flip every tile they touch on enemy ground, clean returns build a streak, and whoever holds more of the board when the clock runs out wins.

**[Play now → combatpong.com](https://www.combatpong.com)**

## How it plays

- The board starts split: your warm half below, the night above.
- Slam **your** amber ball to send it deeper and faster; meet the enemy ball to cushion it away. Offense and defense live in the same motion.
- Every clean return builds a streak that adds speed (and climbs the musical scale). A ball slipping past you only resets the streak — territory is the only score, so a miss never feels like death.
- After 90 seconds, whoever holds more tiles takes the duel.

Four modes — Calm, Classic, Quick, Chaos — change the number of balls, the tempo, and how sharp the night plays.

## Design

The whole game is tuned to be **satisfying and relaxing at once**:

- Two continuous masses of territory, no grid lines, an organic frontier with dawn light bleeding into the night.
- A fixed-timestep simulation (240 Hz), so the physics feel identical on every display.
- Squash-and-stretch, 28 ms hit-stop, soft trails and capture blooms — feel lives in the simulation, not in screen shake.
- A generative soundscape on the D major pentatonic scale: captures are wind chimes, returns are warm plucks. Any sequence is musical by construction.

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
    ├── audio.ts            # Generative pentatonic soundscape
    ├── GameCanvas.tsx      # Match screen: rAF loop, input, HUD, overlays
    ├── ShareCard.ts        # Result cards drawn from your actual final board
    ├── PlayerStats.ts      # Local career stats
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
