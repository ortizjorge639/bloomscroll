# BloomScroll - Build Memory

## Project Overview

BloomScroll is a TikTok-style infinite scroll knowledge feed for X/Twitter bookmarks. Built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, and IndexedDB for local-first data persistence.

## Architecture Decisions

### Data Layer
- **Local-first with IndexedDB**: Chose IndexedDB over a backend database for privacy and offline capability. All bookmark data stays on the user's device.
- **React Context for state**: DataProvider manages all app state with async operations for CRUD. This works well for the current scale but may need optimization for 1000+ bookmarks.
- **Type-safe models**: Bookmark, Tag, and Author types defined in `/types/index.ts` with TagColor union type for the 8 predefined tag colors.

### Navigation
- **Desktop**: Fixed 64px sidebar with icon-only nav + tooltips
- **Mobile**: Fixed bottom navigation bar with labels (16px height + safe area)
- **Routes**: Feed (default), Grid, List, Archived, Settings

### Feed Implementation
- **Snap scrolling**: CSS `scroll-snap-type: y mandatory` for card-by-card navigation
- **Keyboard navigation**: Arrow keys, j/k (vim-style), Space, Home/End supported
- **Progress indicator**: Shows current position (e.g., "3 / 8") with up/down buttons on desktop

### Tag System
- **8 predefined colors**: blue, green, yellow, red, purple, cyan, orange, pink
- **Inline editing**: Add/remove tags directly on post cards via popover
- **Multi-tag filtering**: Filter by multiple tags simultaneously from the top bar

---

## File Structure

```
/app
  /(main)
    /feed/page.tsx      - BloomScroll vertical feed
    /grid/page.tsx      - Pinterest-style grid
    /list/page.tsx      - Twitter-like list view
    /archived/page.tsx  - Archived bookmarks
    /settings/page.tsx  - Import/Export, tag management
    layout.tsx          - Main layout with sidebar + DataProvider

/components
  /feed
    bloom-scroll-feed.tsx  - Main feed with snap scroll + keyboard nav
    post-card.tsx          - Card component with 3 variants (feed/compact/list)
  /nav
    sidebar-nav.tsx        - Desktop sidebar + mobile bottom nav
    top-bar.tsx            - Filter bar with tag pills
  /browser
    popup-browser.tsx      - Modal iframe for viewing links
  empty-state.tsx          - Empty state component

/lib
  db.ts                    - IndexedDB setup and helpers
  import-export.ts         - JSON import/export utilities
  mock-data.ts             - Sample bookmarks for testing
  /storage
    bookmarks.ts           - Bookmark CRUD operations
    tags.ts                - Tag CRUD operations
  /context
    data-context.tsx       - React context provider

/types
  index.ts                 - TypeScript type definitions
```

---

## Known Limitations & Technical Debt

### Performance
1. **No virtualization**: All bookmarks render in DOM. For 500+ items, should implement virtual scrolling (e.g., react-window or tanstack-virtual).
2. **No pagination**: Currently loads all bookmarks at once. Should add cursor-based pagination for large datasets.
3. **Re-renders on filter**: Filtering triggers full re-render. Consider memoization or moving filter logic to IndexedDB queries.

### Features Missing
1. **Search**: No text search within bookmarks. Would need full-text index in IndexedDB or client-side fuzzy search.
2. **Sort options**: Only newest-first. Add options for oldest-first, alphabetical, by tag.
3. **Bulk operations**: No way to bulk archive/delete/tag bookmarks.
4. **Sync**: No cloud sync. All data is device-local only.
5. **Chrome extension**: No browser extension to save bookmarks directly from X.

### UX Improvements Needed
1. **Onboarding**: No first-run experience explaining the app
2. **Gestures**: Mobile swipe gestures for archive/tag actions
3. **Haptic feedback**: No haptic feedback on mobile actions
4. **Keyboard shortcuts help**: No visible keyboard shortcuts reference

### Code Quality
1. **Tests**: No unit or integration tests
2. **Error boundaries**: No React error boundaries for graceful failure
3. **Loading states**: Some operations lack loading indicators
4. **Accessibility audit**: Needs ARIA improvements and keyboard focus management

---

## Recommendations for Next Phase

### Priority 1: Core UX
- [ ] Add text search with highlighting
- [ ] Implement swipe gestures on mobile (swipe left = archive, swipe right = tag)
- [ ] Add onboarding flow for first-time users
- [ ] Create keyboard shortcuts modal (press `?` to show)

### Priority 2: Performance
- [ ] Implement virtual scrolling for 100+ bookmarks
- [ ] Add pagination to IndexedDB queries
- [ ] Memoize filtered bookmark computations

### Priority 3: Features
- [ ] Chrome extension for saving bookmarks
- [ ] Sort options (date, alphabetical, tag count)
- [ ] Bulk selection mode for mass operations
- [ ] Export to Notion/Obsidian format

### Theme System (Implemented)
Four themes are live, selectable in Settings > Appearance:
- **Dark** — Pure black, X/Twitter-blue accent (default)
- **Light** — Clean white, navy-blue accent
- **Sunny** — Warm cream `oklch(0.955 0.025 85)` bg, deep forest green `oklch(0.22 0.08 145)` text; warm ambient top wash via `body::before`
- **Moonshine** — Deep midnight navy `oklch(0.095 0.038 255)` bg, silver-blue `oklch(0.88 0.045 220)` text; radial lunar-ray glow via `body::before`

Theme persisted to `localStorage` key `bloomscroll-theme`. Applied before first paint via inline `<ThemeInitScript>` (avoids FOUC). Managed by `ThemeProvider` in `/lib/context/theme-context.tsx`.

### Priority 4: Polish
- [ ] Haptic feedback on iOS
- [ ] PWA manifest for installability
- [ ] Offline indicator

---

## API Design Notes (for future backend)

If adding a backend, suggested API structure:

```
POST   /api/bookmarks          - Create bookmark
GET    /api/bookmarks          - List bookmarks (paginated)
GET    /api/bookmarks/:id      - Get single bookmark
PATCH  /api/bookmarks/:id      - Update bookmark
DELETE /api/bookmarks/:id      - Delete bookmark

POST   /api/tags               - Create tag
GET    /api/tags               - List tags
PATCH  /api/tags/:id           - Update tag
DELETE /api/tags/:id           - Delete tag

POST   /api/import             - Bulk import from JSON
GET    /api/export             - Export all data
```

Consider using Supabase or Neon for database with RLS for multi-user support.

---

## Design System Reference

### Colors
- Primary: `oklch(0.65 0.19 240)` - X/Twitter blue
- Background: `oklch(0.0 0 0)` - Pure black
- Card: `oklch(0.08 0 0)` - Slightly elevated
- Muted: `oklch(0.18 0 0)` - Borders/dividers

### Typography
- Font: Geist (sans) + Geist Mono
- Feed text: 16px mobile, 20px tablet, 24px desktop
- Body: 14px
- Labels: 12px

### Spacing
- 8pt grid system
- Card padding: 16px mobile, 24px desktop
- Section gaps: 24px

### Motion
- Fast: 150ms (hover states)
- Normal: 250ms (transitions)
- Slow: 400ms (page transitions)
- Easing: cubic-bezier(0.16, 1, 0.3, 1)

---

## Commands Reference

```bash
# Development
pnpm dev

# Build
pnpm build

# Type check
pnpm tsc --noEmit
```

---

*Last updated: March 2026*
*Built by v0*
