# LEB Monitor

Real-time multi-source news aggregator for the Lebanon–Israel conflict. Streams articles from **47+ RSS feeds** across war coverage, breaking news, and regional analysis — in both Arabic and English.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Real-time streaming** — Feeds arrive via NDJSON as each source resolves; no waiting for all 47
- **Auto-refresh** — Polls every 30 seconds with smart deduplication
- **3 feed categories** — War Focused, Breaking News, General/Analysis with tab filtering
- **47+ RSS sources** — LBC, Al Jazeera, BBC, UN, MSF, Amnesty, Bellingcat, and more
- **Arabic + English** — Automatic RTL/LTR text direction detection
- **Source management** — Toggle, reorder, and hide individual feeds via settings panel
- **Infinite scroll** — Paginated card grid with IntersectionObserver
- **Dark mode** — Enabled by default with OKLCh color system
- **Responsive** — 1 / 2 / 3 column grid across mobile, tablet, and desktop
- **Entrance animations** — New articles animate in on arrival
- **Error resilience** — Individual feed failures don't block others (Promise.allSettled)
- **Persistent preferences** — Feed visibility and ordering saved to localStorage

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  LiveFeed    │  │  FeedCard    │  │  Settings  │  │
│  │  (container) │  │  (article)   │  │  (panel)   │  │
│  └──────┬──────┘  └──────────────┘  └───────────┘  │
│         │                                           │
│  ┌──────┴──────┐  ┌──────────────┐                  │
│  │useFeedStream│  │ useFeedPrefs │                  │
│  │  (NDJSON)   │  │ (localStorage│                  │
│  └──────┬──────┘  └──────────────┘                  │
│         │ fetch + stream                            │
└─────────┼───────────────────────────────────────────┘
          │
┌─────────┴───────────────────────────────────────────┐
│              Next.js API Route                       │
│                                                      │
│  GET /api/feeds                                      │
│  ├── Fetch 47 RSS feeds in parallel                  │
│  ├── Parse XML → FeedItem[]                          │
│  ├── Stream batches as NDJSON                        │
│  └── Report errors per source                        │
└──────────────────────────────────────────────────────┘
```

### Stream Protocol

The `/api/feeds` endpoint returns newline-delimited JSON:

```jsonc
// As each feed resolves:
{"type":"batch","items":[...],"source":"Al Jazeera EN"}

// If a feed fails:
{"type":"error","source":"NNA","message":"HTTP 503"}

// When all feeds finish:
{"type":"done","sources":47,"errors":[...],"fetchedAt":"2026-03-02T12:00:00Z"}
```

---

## Project Structure

```
leb-monitor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, metadata
│   │   ├── page.tsx                # Home page (renders LiveFeed)
│   │   ├── globals.css             # Tailwind + OKLCh theme tokens
│   │   └── api/feeds/
│   │       └── route.ts            # NDJSON streaming RSS API
│   │
│   ├── components/
│   │   ├── live-feed.tsx           # Main feed container + filters
│   │   ├── feed-card.tsx           # Article card (RTL-aware)
│   │   ├── feed-settings.tsx       # Feed management side panel
│   │   └── ui/                     # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sheet.tsx
│   │       ├── scroll-area.tsx
│   │       ├── switch.tsx
│   │       ├── badge.tsx
│   │       ├── skeleton.tsx
│   │       └── separator.tsx
│   │
│   ├── config/
│   │   └── feeds.ts                # 47 RSS feed definitions
│   │
│   ├── hooks/
│   │   ├── use-feed-stream.ts      # NDJSON streaming + merge logic
│   │   └── use-feed-prefs.ts       # localStorage preference hook
│   │
│   └── lib/
│       └── utils.ts                # cn() classname utility
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json                 # shadcn/ui config
├── postcss.config.mjs
├── eslint.config.mjs
└── tailwind.config (via CSS)       # Tailwind v4 CSS-based config
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
git clone https://github.com/<your-username>/leb-monitor.git
cd leb-monitor
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The feed begins streaming immediately.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Feed Sources

### War Focused (17 sources)

| Source | Coverage |
|--------|----------|
| LBC War | Lebanese conflict updates |
| ReliefWeb LB | Humanitarian situation reports |
| OCHA Lebanon | UN humanitarian coordination |
| UN Middle East | United Nations regional desk |
| UN Peace | Peace & security dispatches |
| Middle East Monitor | Regional conflict reporting |
| Middle East Eye | Investigative journalism |
| Al Manar | Lebanese perspective |
| +972 Magazine | Israeli–Palestinian coverage |
| Mondoweiss | Palestinian rights reporting |
| Electronic Intifada | Palestinian news & analysis |
| Crisis Group | Conflict resolution analysis |
| Bellingcat | Open-source investigations |
| MSF | Doctors Without Borders field reports |
| Amnesty International | Human rights documentation |
| Defense News | Military & defense industry |
| War on the Rocks | National security analysis |

### Breaking News (11 sources)

| Source | Coverage |
|--------|----------|
| LBC Breaking / Latest | Lebanese breaking news |
| NNA | National News Agency of Lebanon |
| The961 | Lebanese news & culture |
| Times of Israel | Israeli news coverage |
| Jerusalem Post (Headlines + Defense) | Israeli perspective |
| Al Jazeera EN | Pan-Arab English news |
| BBC Middle East | British international coverage |
| Al Hurra | US-funded Arabic news |
| Anadolu Agency | Turkish state news agency |

### General / Analysis (19 sources)

**Arabic:** Al Jazeera AR, Sky News Arabia, BBC Arabic, BBC AR Middle East, France 24 AR, DW Arabic, Annahar, Al Arabiya, Asharq Al-Awsat, Lebanon Debate, Al Quds, Rai Al Youm

**English:** Al-Monitor, The New Arab, Guardian Middle East, Foreign Policy

---

## Configuration

### Adding a New Feed

Edit `src/config/feeds.ts`:

```typescript
export const RSS_FEEDS: FeedSource[] = [
  // ... existing feeds
  {
    name: "Your Source",
    url: "https://example.com/rss",
    color: "#hex-color",        // Accent color for the source
    category: "war",            // "war" | "breaking" | "general"
  },
];
```

The feed will appear automatically on the next page load.

### Feed Categories

| Category | Color | Purpose |
|----------|-------|---------|
| `war` | Red (#ef4444) | Conflict, military, humanitarian |
| `breaking` | Amber (#f59e0b) | Fast-moving, time-sensitive news |
| `general` | Gray (#6b7280) | Broader analysis and coverage |

### User Preferences

Preferences are stored in `localStorage` under the key `lebmon-feed-prefs`:

```json
{
  "order": ["Al Jazeera EN", "BBC ME", "..."],
  "hidden": ["Source to hide"]
}
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui + Radix UI | latest |
| Icons | Lucide React | 0.576 |
| RSS Parsing | rss-parser | 3.13 |
| Data Fetching | SWR | 2.4 |
| Fonts | Poppins + Noto Sans Arabic | Google Fonts |

---

## Deployment

### Vercel (Recommended)

The app is fully compatible with Vercel. Connect your GitHub repository and it deploys on every push to `main`.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note:** Enable `output: "standalone"` in `next.config.ts` for Docker builds.

### Self-Hosted

```bash
npm run build
NODE_ENV=production npm start
```

The app binds to port 3000 by default. Use a reverse proxy (nginx, Caddy) for HTTPS in production.

---

## Contributing

Contributions are welcome. Whether it's adding new feed sources, fixing bugs, improving the UI, or enhancing performance — all PRs are appreciated.

### How to Contribute

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** and ensure the code lints cleanly:
   ```bash
   npm run lint
   ```
4. **Build** to verify nothing is broken:
   ```bash
   npm run build
   ```
5. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add Reuters RSS feed source"
   ```
6. **Push** to your fork and **open a Pull Request** against `main`

### PR Guidelines

- **One feature/fix per PR** — keep changes focused and reviewable
- **Describe what and why** — explain the motivation in the PR description
- **Test locally** — run `npm run dev` and verify your changes work
- **Follow existing patterns** — match the coding style already in the codebase
- **Keep it small** — smaller PRs are easier to review and merge faster

### Ideas for Contributions

| Area | Examples |
|------|---------|
| New feed sources | Add RSS feeds from credible news outlets |
| UI improvements | Better mobile layout, accessibility, animations |
| Performance | Reduce bundle size, optimize streaming |
| i18n | Language detection improvements, UI translations |
| Features | Search, bookmarks, push notifications, sharing |
| Bug fixes | Edge cases, error handling, XML parsing |
| Documentation | Improve README, add inline comments |

### Code Style

- TypeScript strict mode is enabled
- Functional components with hooks
- Named exports preferred
- Tailwind utility classes for all styling
- Keep components small and focused
- Follow the existing file structure under `src/`

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve a bug
docs: update documentation
style: formatting, no logic change
refactor: restructure without behavior change
chore: tooling, dependencies
```

---

## License

This project is open source under the [MIT License](LICENSE).

---

## Acknowledgments

Built with data from independent journalists, humanitarian organizations, and news agencies covering the Lebanon–Israel conflict. This tool aggregates publicly available RSS feeds and does not generate or editorialize content.

---

<p align="center">
  <strong>LEB<span>MON</span></strong> — Conflict Monitor v1.0
</p>
