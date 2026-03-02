# Contributing to LEB Monitor

Thank you for your interest in contributing to LEB Monitor. Whether you're fixing a bug, adding a feed source, improving the UI, or just reporting a problem — every contribution helps.

---

## Table of Contents

- [Reporting a Problem](#reporting-a-problem)
- [Suggesting a Feature](#suggesting-a-feature)
- [Setting Up for Development](#setting-up-for-development)
- [Making Changes](#making-changes)
- [Opening a Pull Request](#opening-a-pull-request)
- [Adding a New Feed Source](#adding-a-new-feed-source)
- [Project Architecture](#project-architecture)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Code of Conduct](#code-of-conduct)

---

## Reporting a Problem

Found a bug? A feed that isn't loading? Something that doesn't look right? Open an issue.

### Before You Report

1. Check [existing issues](../../issues) to see if it's already reported
2. Try a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to rule out caching
3. Check the browser console (`F12` → Console) for error messages

### How to Report

Open a [new issue](../../issues/new) and include:

| Field | Details |
|-------|---------|
| **Title** | Short, specific (e.g., "Al Jazeera EN feed returns 0 articles") |
| **What happened** | Describe the problem clearly |
| **What you expected** | What should have happened instead |
| **Steps to reproduce** | Numbered steps to trigger the bug |
| **Browser / OS** | e.g., Chrome 124 on macOS 15, Firefox 130 on Windows 11 |
| **Screenshots** | Attach if the issue is visual |
| **Console errors** | Paste any errors from the browser console |

#### Example Bug Report

```
Title: BBC Middle East feed shows "1 feed(s) down" after every refresh

What happened:
The BBC ME source always appears in the error bar at the top.
No articles from BBC ME load. Other feeds work fine.

Steps to reproduce:
1. Open http://localhost:3000
2. Wait for feeds to load
3. See "1 feed(s) down" in the amber bar
4. The source "BBC ME" has 0 articles

Browser/OS: Safari 18 on macOS 15.3
```

### Feed-Specific Issues

If a specific feed source is broken (returning errors, wrong articles, or no results):

1. Note the **source name** as shown in the UI
2. Check if the source's website is up
3. Try the RSS URL directly in your browser — you can find it in `src/config/feeds.ts`
4. Mention all of this in your issue

---

## Suggesting a Feature

Have an idea? Open an issue with the **Feature Request** label.

Include:
- **What** — What you'd like to see
- **Why** — What problem it solves or what it improves
- **How** (optional) — Any thoughts on implementation

Good feature requests:
- "Add a search bar to filter articles by keyword"
- "Add keyboard shortcuts for switching categories"
- "Support light mode toggle"

---

## Setting Up for Development

### Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js), or yarn/pnpm/bun
- **Git**

### Setup

```bash
# 1. Fork the repo on GitHub (click the "Fork" button)

# 2. Clone your fork
git clone https://github.com/<your-username>/leb-monitor.git
cd leb-monitor

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

The app will hot-reload as you edit files.

### Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm start` | Run the production build |
| `npm run lint` | Check code for linting errors |

---

## Making Changes

### 1. Create a Branch

Always work on a branch, never directly on `main`:

```bash
git checkout -b feat/your-feature-name    # for features
git checkout -b fix/describe-the-bug      # for bug fixes
git checkout -b docs/what-you-changed     # for documentation
```

### 2. Make Your Changes

- Edit the relevant files in `src/`
- Follow the [code style](#code-style) guidelines
- Keep changes focused — don't mix unrelated changes

### 3. Verify Your Work

```bash
# Lint — must pass with no errors
npm run lint

# Build — must succeed
npm run build

# Manual test — open in browser and verify
npm run dev
```

### 4. Commit

Write clear commit messages following the [commit convention](#commit-convention):

```bash
git add src/config/feeds.ts
git commit -m "feat: add France 24 English RSS feed"
```

### 5. Push

```bash
git push origin feat/your-feature-name
```

---

## Opening a Pull Request

### Before You Open

- [ ] Your branch is up to date with `main`
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] You've tested your changes in the browser
- [ ] Changes are focused on a single feature or fix

### PR Description Template

When opening your PR, use this structure:

```markdown
## What

Brief description of what this PR does.

## Why

What problem does this solve? What does it improve?

## Changes

- Changed X in `file.ts`
- Added Y to `config.ts`

## How to Test

1. Run `npm run dev`
2. Open http://localhost:3000
3. [Specific steps to verify the change]

## Screenshots (if visual)

Before | After
-------|------
...    | ...
```

### What Happens After You Open a PR

1. A maintainer will review your code
2. You may receive feedback — this is normal and constructive
3. Address feedback by pushing new commits to the same branch
4. Once approved, the PR will be merged

### Tips for Getting Your PR Merged Faster

- **Keep it small** — PRs under 200 lines get reviewed much faster
- **One concern per PR** — Don't bundle a bug fix with a feature
- **Explain the "why"** — Reviewers understand changes faster with context
- **Include screenshots** — For any visual change, before/after screenshots help a lot
- **Respond to feedback** — Even a "good point, fixed" keeps things moving

---

## Adding a New Feed Source

This is one of the easiest and most impactful contributions.

### Step-by-Step

1. **Find a source** — Look for a credible news outlet covering the conflict or Middle East region that offers a public RSS feed

2. **Verify the feed URL** — Open it in a browser or run:
   ```bash
   curl -s "https://example.com/feed" | head -30
   ```
   You should see XML with `<item>` or `<entry>` elements.

3. **Choose a category:**

   | Category | When to Use |
   |----------|------------|
   | `war` | Conflict, military ops, humanitarian, ceasefire updates |
   | `breaking` | Fast-moving general news that includes conflict coverage |
   | `general` | Broader analysis, opinion, regional politics |

4. **Pick a brand color** — Find the source's primary brand color (check their website or logo). Use a hex value like `#1976d2`.

5. **Add to `src/config/feeds.ts`** under the correct category section:

   ```typescript
   { name: "Source Name", url: "https://example.com/feed", color: "#1976d2", category: "breaking" },
   ```

6. **Test locally** — Run `npm run dev` and verify:
   - Articles from the new source appear in the feed
   - The source shows up in the source chips bar
   - The source appears in the settings panel
   - Articles display correctly (title, snippet, image if available)

7. **Open a PR** with the title: `feat: add <Source Name> RSS feed`

### Feed Source Guidelines

- Must be a legitimate news organization, wire service, or humanitarian agency
- RSS feed must be publicly accessible (no login or API key required)
- Prefer topic-specific feeds (e.g., "Middle East" section) over broad "World" feeds
- Use short, recognizable names — `BBC ME` not `British Broadcasting Corporation Middle East News`
- The `color` should be recognizable as the source's brand

---

## Project Architecture

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, metadata, dark mode)
│   ├── page.tsx                    # Home page → renders <LiveFeed />
│   ├── globals.css                 # Tailwind config + OKLCh color tokens
│   └── api/feeds/
│       └── route.ts                # Server: fetch RSS → stream NDJSON
│
├── components/
│   ├── live-feed.tsx               # Main container: tabs, filters, grid
│   ├── feed-card.tsx               # Single article card (RTL-aware)
│   ├── feed-settings.tsx           # Settings side panel (toggle/reorder)
│   └── ui/                         # shadcn/ui primitives (button, sheet, etc.)
│
├── config/
│   └── feeds.ts                    # All 47+ feed source definitions
│
├── hooks/
│   ├── use-feed-stream.ts          # NDJSON streaming + smart merge + polling
│   └── use-feed-prefs.ts           # localStorage preference management
│
└── lib/
    └── utils.ts                    # cn() classname utility
```

### How Data Flows

1. **Browser** calls `GET /api/feeds`
2. **API route** fetches all 47 RSS feeds in parallel via `Promise.allSettled`
3. As each feed resolves, it's parsed and **streamed as NDJSON** back to the browser
4. **`useFeedStream` hook** reads the stream, merges items (deduplicating by `source::link`), and sorts by date
5. **`LiveFeed` component** filters and renders items in a responsive card grid
6. Every **30 seconds**, the cycle repeats — new articles merge in with entrance animations

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| NDJSON streaming | Articles appear progressively as feeds resolve — no waiting for all 47 |
| Client-side filtering | Keeps the API simple; one endpoint, no query params |
| localStorage preferences | No backend needed for per-user feed customization |
| `Promise.allSettled` | One broken feed doesn't block the other 46 |
| RTL detection via Unicode ranges | Works for Arabic and Hebrew content without external libraries |
| `lang` attribute on RTL text | Enables proper font selection and hyphenation |
| Animation cleanup via setTimeout | `newIds` cleared after 600ms to match CSS transition duration |

---

## Code Style

### General

- **TypeScript** strict mode — avoid `any`, use proper types
- **Functional components** with hooks — no class components
- **Named exports** preferred over default exports
- **Tailwind utility classes** for styling — no CSS modules or styled-components
- **Inline styles** only for dynamic values (e.g., source brand colors)

### File Conventions

| Convention | Example |
|-----------|---------|
| File names | `kebab-case.tsx` |
| Component names | `PascalCase` |
| Hook names | `useCamelCase` |
| Types/interfaces | `PascalCase` |
| Constants | `SCREAMING_SNAKE_CASE` |

### Do

- Keep components small and focused
- Use `memo()` for components that receive stable props
- Use `useMemo` / `useCallback` for expensive computations
- Handle image load errors gracefully
- Support RTL text direction

### Don't

- Add external state management (Redux, Zustand) — the app is intentionally simple
- Add CSS files — use Tailwind classes
- Add `console.log` in committed code (use `console.error` for actual errors)
- Modify `ui/` components directly — these are shadcn/ui primitives

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to Use |
|--------|-------------|
| `feat:` | New feature, new feed source, new UI element |
| `fix:` | Bug fix, broken feed, rendering issue |
| `docs:` | README, CONTRIBUTING, inline comments |
| `style:` | Code formatting only (no logic change) |
| `refactor:` | Code restructure (no behavior change) |
| `perf:` | Performance improvement |
| `chore:` | Dependencies, tooling, CI config |

### Examples

```
feat: add Reuters Middle East RSS feed
feat: add keyboard shortcut for category switching
fix: handle timeout when NNA feed is unreachable
fix: RTL text alignment in feed card snippet
docs: add Docker deployment instructions to README
refactor: extract XML sanitizer into utility module
perf: debounce intersection observer callback
chore: update Next.js to 16.2
```

---

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get started
- Focus feedback on the code, not the person
- This project aggregates news from all sides of the conflict — keep discussions focused on the software, not the politics
- Harassment, discrimination, or abusive behavior will not be tolerated

---

## Questions?

- Open a [GitHub Discussion](../../discussions) for general questions
- Open an [Issue](../../issues) for bugs or feature requests
- Check the [README](README.md) for project overview and setup

Thank you for contributing.
