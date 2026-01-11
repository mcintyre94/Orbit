# CLAUDE.md

This file provides guidance for AI assistants working with the Orbit codebase.

## Project Overview

Orbit is a Chrome extension for organizing Solana wallet accounts. It allows users to store multiple Solana addresses locally with custom labels, notes, and tags. The extension implements the Wallet Standard protocol for Solana, enabling read-only connections to dApps (no signing capability).

**Key Features:**
- Store and organize Solana wallet addresses with labels, notes, and tags
- Filter accounts by tags and search by label/notes/address
- Connect to Solana dApps (read-only via Wallet Standard)
- Import/export addresses and full account data
- All data stored locally in browser extension storage

## Tech Stack

| Category | Technology |
|----------|------------|
| UI Framework | React 18, React Router 6 |
| Component Library | Mantine 8 |
| Language | TypeScript 5.3 |
| Build Tool | Vite 7 + wxt 0.20 (Chrome extension framework) |
| Styling | PostCSS with Mantine preset |
| Icons | Tabler Icons |
| Solana | @solana/addresses, @wallet-standard/core |
| Validation | Zod |
| Package Manager | pnpm |

## Directory Structure

```
Orbit/
├── accounts/                    # Account data layer
│   ├── savedAccount.ts          # Type + Zod schema for SavedAccount
│   └── storage.ts               # CRUD operations (getSavedAccounts, saveNewAccount, etc.)
├── connections/                 # dApp connection tracking
│   └── storage.ts               # Stores which apps have access to which accounts
├── wallet/                      # Wallet Standard implementation
│   ├── orbit.ts                 # OrbitWallet class (main wallet interface)
│   ├── accountsTagsFeature.ts   # Custom tags feature definition
│   └── requestManager.ts        # Promise-based request tracking for async messages
├── entrypoints/                 # Extension entry points (wxt convention)
│   ├── background/              # Service worker for message routing
│   ├── content/                 # Content script (injected into pages)
│   ├── injected/                # Injected script (wallet-standard in page context)
│   └── sidepanel/               # Main UI
│       ├── main.tsx             # React app entry, router setup, Mantine theme
│       ├── layout.tsx           # App shell layout
│       ├── routes/              # Route components with loaders/actions
│       ├── components/          # Reusable UI components
│       ├── utils/               # Helper functions
│       └── styles/              # CSS modules
├── public/                      # Static assets (icons)
├── wxt.config.ts                # Extension manifest and Vite config
├── tsconfig.json                # TypeScript configuration
└── postcss.config.cjs           # PostCSS + Mantine CSS setup
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (opens browser with extension installed, hot reload)
pnpm dev

# Firefox development
pnpm dev:firefox

# Production build (outputs to .output/chrome-mv3)
pnpm build

# Package for Chrome Web Store
pnpm zip

# Type checking only
pnpm compile
```

## Architecture

### Extension Communication Flow

The extension uses a multi-layer message passing system:

```
dApp (page) → Injected Script → Content Script → Background → Sidepanel UI
           ←                 ←                 ←            ←
```

1. **Injected Script** (`entrypoints/injected/`): Runs in page context, registers `OrbitWallet` with wallet-standard
2. **Content Script** (`entrypoints/content/`): Bridge between page and extension, handles `window.postMessage`
3. **Background Script** (`entrypoints/background/`): Service worker that routes messages between content and sidepanel
4. **Sidepanel** (`entrypoints/sidepanel/`): React UI opened as Chrome sidepanel

### Request/Response Pattern

Async communication uses `RequestManager` which maintains a map of request IDs to promise resolvers:
- Each request generates a unique `requestId`
- The response includes the same `requestId` to match with the waiting promise
- Factory functions create typed events (e.g., `makeRequestConnectionEvent()`)

### Data Storage

All data uses Chrome extension storage API via wxt's `storage` import:
- `local:accounts` - Array of `SavedAccount` objects
- `local:connections` - Map of origin URLs to connected addresses

### React Router Patterns

The app uses React Router 6 data APIs extensively:
- **Loaders**: Fetch data before rendering (`loader` functions exported from route files)
- **Actions**: Handle form submissions (`action` functions)
- `useRouteLoaderData('accounts-route')` - Access parent route data
- `useFetcher` - Non-navigation data fetching (used for filtering)
- URL query params for filter state (`?enableFilters=enabled&tag=xxx&search=yyy`)

## Code Conventions

### TypeScript

- Use `.ts` for non-JSX, `.tsx` for JSX files
- Private class fields use `#` prefix (e.g., `#requestManager`)
- Use Zod for runtime validation of external data
- Generic types for loader/action data: `Awaited<ReturnType<typeof loader>>`

### React Components

- Functional components with hooks
- Props interfaces defined above component
- Use Mantine components for UI consistency
- Forms use React Router's `<Form>` component

### Imports

Path aliases configured in wxt:
- `#imports` - wxt utilities (storage)
- `~/` - Project root
- `@/` - Entrypoints directory

Import order: external packages → internal modules → relative imports

### Naming Conventions

- `makeXxxEvent()` - Factory functions for typed events
- `getXxx()` - Data fetching functions
- Route files export `loader`, `action`, and default component

### Error Handling

- Try-catch in action functions
- Mantine notifications for user-facing errors
- Validation errors returned as `{ error: string }` from actions

## Key Files Reference

| File | Purpose |
|------|---------|
| `wallet/orbit.ts` | Main `OrbitWallet` class implementing Wallet Standard |
| `accounts/storage.ts` | All account CRUD operations |
| `entrypoints/sidepanel/main.tsx` | Router config, theme setup, app entry |
| `entrypoints/background/index.ts` | Message routing between content and sidepanel |
| `entrypoints/content/content.ts` | Wallet injection, message handling, connection saving |
| `accounts/savedAccount.ts` | `SavedAccount` type and Zod schema |

## Common Tasks

### Adding a New Route

1. Create component in `entrypoints/sidepanel/routes/`
2. Export `loader` and/or `action` functions if needed
3. Add route config in `main.tsx` router

### Modifying Account Data

1. Update `SavedAccount` type in `accounts/savedAccount.ts`
2. Update Zod schema in the same file
3. Update storage functions in `accounts/storage.ts`

### Adding Extension Permissions

Update `manifest.permissions` in `wxt.config.ts`

### Working with Wallet Standard

- The wallet implements `StandardConnect`, `StandardDisconnect`, `StandardEvents`
- `SolanaSignTransaction` is implemented but throws (required by wallet-adapter to show in UI)
- Custom `AccountsTags` feature for tag retrieval

## Testing

No automated testing framework is currently configured. Testing is manual.

## Build Output

Production builds output to `.output/chrome-mv3/` which can be zipped and submitted to the Chrome Web Store.

## Important Notes

- The extension is read-only - it cannot sign transactions
- All data is stored locally in browser extension storage
- Dark mode is forced via Mantine's `forceColorScheme='dark'`
- Address validation uses `@solana/addresses` `isAddress()` function
- Labels must be unique (case-insensitive comparison with "accent" sensitivity)
