# Combat Pong

A territory control game inspired by [Pong Wars](https://github.com/vnglst/pong-wars). Battle against AI or challenge friends in real-time multiplayer — conquer more than 50% of the board in 90 seconds to win.

**[Play Now](https://www.combatpong.com)**

https://github.com/user-attachments/assets/9dca82f4-fb93-480a-9a50-d5a5e7a5b129


## How It Works

The board is a 24x24 grid split between two teams:

- **Day** (you) — warm cream/gold, bottom paddle
- **Night** (AI) — cool slate/indigo, top paddle

Balls bounce around the board converting enemy tiles to your team's color on contact. Move your paddle to deflect balls and protect your territory. When the 90-second timer runs out, the team with more tiles wins.

### Streak System

Every consecutive paddle hit adds **+0.25x speed** to the ball (cumulative):

| Hits | Speed Multiplier |
|------|-----------------|
| 1    | 1.25x           |
| 2    | 1.50x           |
| 3    | 1.75x           |
| 4+   | keeps stacking  |

Missing a ball at the wall resets your streak to 0 and slows the ball by 15%.

### Difficulty Modes

| Mode      | Balls | Speed | AI Reaction |
|-----------|-------|-------|-------------|
| Easy      | 2     | 0.7x  | Slow        |
| Medium    | 2     | 1.0x  | Normal      |
| Hard      | 4     | 1.2x  | Fast        |
| Nightmare | 6     | 1.5x  | Very Fast   |

## Features

- **Single-player** with 4 difficulty levels and AI opponent
- **Real-time multiplayer** — 1v1 battles via Supabase Realtime (first to 90% territory wins)
- **Streak mechanics** — consecutive hits make balls faster and more chaotic
- **Visual effects** — particle bursts, screen shake, ball trails
- **Mobile-first** — fully optimized touch controls, responsive canvas
- **Player stats** — win/loss tracking in localStorage (syncs to Supabase when logged in)
- **Social sharing** — generates score card images and shares to X/Twitter
- **PWA-ready** — installable as a web app with offline icon support

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Framework   | React 18 + TypeScript                          |
| Build       | Vite                                            |
| Styling     | Tailwind CSS                                    |
| Backend     | Supabase (Auth, Realtime, Storage)              |
| Rendering   | HTML5 Canvas (requestAnimationFrame game loop)  |
| Deployment  | Vercel                                          |

## Project Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Router + auth state management
├── supabaseClient.ts           # Supabase client singleton
├── index.css                   # Tailwind imports + custom animations
│
├── game/
│   ├── GameLoop.ts             # Core physics, collision, rendering, input
│   ├── GameCanvas.tsx          # Game UI wrapper (HUD, overlays, controls)
│   ├── constants.ts            # All tunable game values
│   ├── types.ts                # TypeScript interfaces (Ball, Paddle, GameState)
│   ├── PlayerStats.ts          # Win/loss tracking (localStorage + Supabase)
│   ├── ShareCard.ts            # Score card image generation + Twitter sharing
│   │
│   └── network/
│       ├── MultiplayerGame.tsx # Real-time multiplayer game component
│       ├── Matchmaking.ts      # Lobby system via Supabase Presence
│       └── types.ts            # Network protocol type definitions
│
├── components/
│   ├── MainMenu.tsx            # Home screen with difficulty selector
│   ├── Auth.tsx                # Google OAuth login
│   ├── SEOPages.tsx            # Mode landing pages + How to Play
│   ├── MoreSEOPages.tsx        # FAQ, About, Tips, Multiplayer guide
│   ├── ExtendedSEOPages.tsx    # Game mechanics guides
│   ├── AdditionalSEOPages.tsx  # History, challenges, browser compatibility
│   ├── TargetedSEOPages.tsx    # Audience-targeted content pages
│   ├── MoreTargetedSEOPages.tsx
│   ├── FinalSEOPages.tsx       # Long-tail keyword pages
│   └── SEOFooter.tsx           # Shared footer with internal links
│
public/
├── favicon-*.png               # App icons (16, 32, 192, 512px)
├── apple-touch-icon.png        # iOS icon
├── og-image.png                # Social share image (1200x630)
├── manifest.json               # PWA manifest
├── robots.txt                  # Crawler directives
└── sitemap.xml                 # Sitemap for search engines
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/slegarraga/combat-pong.git
cd combat-pong

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

### Environment Variables

The game works in single-player mode without any configuration. For multiplayer and authentication, you need a [Supabase](https://supabase.com) project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Supabase Setup (optional)

1. Create a free project at [supabase.com](https://supabase.com)
2. Enable **Google OAuth** in Authentication > Providers
3. Create a **Storage bucket** named `share-cards` (public) for Twitter share images
4. Optionally create a `player_stats` table for cloud stat syncing:

```sql
create table player_stats (
  user_id uuid primary key references auth.users(id),
  games_played int default 0,
  wins int default 0,
  losses int default 0,
  total_territory_conquered int default 0,
  best_score int default 0,
  updated_at timestamptz default now()
);
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Type-check and build for production
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

## Architecture

### Game Engine

The game runs on a `requestAnimationFrame` loop in [GameLoop.ts](src/game/GameLoop.ts). Each frame:

1. **AI** — lerps the top paddle toward the nearest incoming Day ball
2. **Paddle collisions** — AABB test, triggers streak system, applies angle deflection
3. **Tile collisions** — scans grid for enemy tiles overlapping the ball, converts them
4. **Wall boundaries** — bounces balls, applies miss penalty (speed reset + streak loss)
5. **Physics** — random micro-acceleration, speed clamping, position update
6. **Render** — draws tiles, particles, paddles (with glow), and balls (with trails)

### Multiplayer

Uses Supabase Realtime with a host/client architecture:

- **Matchmaking** ([Matchmaking.ts](src/game/network/Matchmaking.ts)) — players join a shared presence channel. First player becomes host; second player joins as client.
- **Game sync** ([MultiplayerGame.tsx](src/game/network/MultiplayerGame.tsx)) — the host runs physics and broadcasts state every frame. The client sends paddle position updates.
- Win condition: first to control 90% of territory.

### Routing

No router library — [App.tsx](src/App.tsx) uses `window.location.pathname` + `history.pushState` to map ~40 URL paths to components. This keeps the bundle small and SEO pages crawlable.

## Contributing

Contributions are welcome! Some ideas:

- **Power-ups** — speed boosts, shield, multi-ball
- **Custom themes** — different color palettes
- **Tournament mode** — bracket-style multiplayer
- **Sound effects** — audio feedback for hits and captures
- **Leaderboard** — global high scores via Supabase

### Development Tips

- Game constants are all in [constants.ts](src/game/constants.ts) — easy to tweak
- The streak system is in `checkPaddleCollision()` in [GameLoop.ts](src/game/GameLoop.ts)
- All multiplayer logic is isolated in `src/game/network/`
- SEO pages follow a repeatable pattern — see any file in `src/components/` for the template

## Credits

- Inspired by [Pong Wars](https://github.com/vnglst/pong-wars) by Koen van Gilst
- Built with [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS](https://tailwindcss.com), and [Supabase](https://supabase.com)

## License

[MIT](LICENSE)
