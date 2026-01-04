# Copilot Instructions for SvelteKit Octave 2026

## Project Overview

This is a **SvelteKit + Supabase** casting management application migrated from MongoDB. It manages contacts, offices, projects, past projects, and comments with a fully normalized PostgreSQL schema.

## Tech Stack

- **SvelteKit** with TypeScript and **Svelte 5** (runes API)
- **Supabase** (PostgreSQL) for backend and auth
- **TanStack Table** (v8) with custom Svelte 5 adapter (`tanstack-table-8-svelte-5`)
- **Tailwind CSS v4** + **shadcn-svelte** (via `bits-ui` primitives)
- **Zod** for schema validation (`src/lib/schemas/`)

## Svelte 5 Runes Pattern

This project uses **Svelte 5 runes exclusively**. Never use Svelte 4 patterns (`let`, `$:`, stores in components).

### Standard patterns:

```svelte
<script lang="ts">
	// Props (from parent)
	let { data }: { data: PageData } = $props();

	// Reactive state
	let searchInput = $state('');

	// Derived values (auto-recompute)
	const contacts = $derived(data.contacts);
	const pageSize = $derived(data.pageSize ?? DEFAULT_PAGE_SIZE);

	// Complex derivations
	const tableOptions = $derived.by(() => {
		return writable({ columns, data: contacts });
	});

	// Side effects
	$effect(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// Debug (remove before commit)
	$inspect('value', someValue);
</script>
```

### Rune-based state classes

For shared reactive state, use `.svelte.ts` files with classes:

```typescript
// src/lib/hooks/is-mobile.svelte.ts
import { MediaQuery } from 'svelte/reactivity';

export class IsMobile extends MediaQuery {
  constructor(breakpoint = 768) {
    super(`max-width: ${breakpoint - 1}px`);
  }
}
```

## Data Loading & Navigation

### Server-side data pattern

Use `+page.server.ts` for Supabase queries with pagination, search, and sorting from URL params:

```typescript
export const load: PageServerLoad = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') ?? '1') || 1;
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE));
  const sortBy = url.searchParams.get('sortBy') ?? 'updated_at';
  const sortOrder = url.searchParams.get('sortOrder') ?? 'desc';

  // Build Supabase query with count
  let query = supabase
    .from('contacts')
    .select('id, first_name, last_name, slug, updated_at', { count: 'exact' });

  // Multi-term search across columns
  if (search) {
    const terms = search.split(/\s+/).filter(Boolean);
    const orConditions = terms
      .flatMap(term => ['first_name', 'last_name'].map(f => `${f}.ilike.%${term}%`))
      .join(',');
    query = query.or(orConditions);
  }

  return { contacts, totalCount, pageSize, sortBy, sortOrder, paginationSettings };
};
```

### Client-side navigation

Use `src/lib/utils/navigate.ts` utilities for URL state management:

```typescript
// Navigate with search params
await navigateTo(
  { search: newSearch, page: 1 },
  { search: currentSearch, page: currentPage, pageSize, sortBy, sortOrder },
  '/contacts',
  { keepFocus: true }
);

// Build URLs for links
const href = buildUrl(
  { page: 5 },
  { search, page, pageSize, sortBy, sortOrder },
  '/contacts'
);
```

**Always preserve URL params** (page, pageSize, sortBy, sortOrder) when navigating unless explicitly changing them.

## Database Access

### Supabase client

Use the typed client from `src/lib/supabase.ts`:

```typescript
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('id', contactId)
  .single();
```

### Regenerate types after schema changes

```bash
npm run db:types
```

This updates `src/lib/database.types.ts` from the Supabase project (`zgzuzseytxhtkgwetstx`).

### Schema conventions

- **Normalized relationships**: Use junction tables (`office_contacts`, `contact_projects`) instead of arrays
- **Shared resources**: `addresses` and `links` tables are many-to-many across offices/contacts/projects
- **MongoDB IDs preserved**: `users`, `offices`, `contacts`, `projects` use TEXT primary keys from original `_id`
- See [supabase/SCHEMA_GUIDE.md](supabase/SCHEMA_GUIDE.md) for full normalization approach

## UI Components & Styling

### shadcn-svelte components

Use components from `src/lib/components/ui/` (installed via `components.json`). These wrap `bits-ui` primitives:

```svelte
import {Button} from '$lib/components/ui/button'; import * as Table from '$lib/components/ui/table'; import
{Input} from '$lib/components/ui/input';
```

### TanStack Table with Svelte 5

This project uses a custom Svelte 5-compatible fork (`tanstack-table-8-svelte-5`):

```svelte
<script lang="ts">
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';

	const tableOptions = $derived.by(() => {
		return writable<TableOptions<Contact>>({
			columns,
			data: contacts,
			getCoreRowModel: getCoreRowModel(),
			manualSorting: true,
			state: { sorting }
		});
	});

	const table = $derived(createSvelteTable(tableOptions));
</script>

{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
	<!-- render headers -->
{/each}
```

**Important**: Server-side sorting is preferred. Set `manualSorting: true` and handle sorting in `+page.server.ts`.

### Tailwind CSS v4

- Config in `@import "tailwindcss"` in `src/app.css`
- Use utility classes directly: `class="flex items-center gap-4"`
- Custom components use Tailwind variants via `tailwind-variants` package

## Development Workflow

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type check (svelte-check)
npm run lint         # ESLint
npm run format       # Prettier
npm run db:types     # Regenerate Supabase types
```

### Migration scripts

Scripts in `scripts/` handle data migration from MongoDB exports:

- `migrate-to-supabase.ts`: Main migration (see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md))
- `migrate-the_address.ts`: Address-specific migration with deduplication

Run with `npx tsx scripts/<script-name>.ts` after setting `.env.local` with Supabase credentials.

## Patterns to Follow

### Pagination

Use `TablePaginationControls.svelte` for consistent pagination UI. The component handles URL building and page size change logic internally:

```svelte
<TablePaginationControls
	{paginationSettings}
	{totalCount}
	itemType="contact"
	basePath="/contacts"
	urlState={{ search: searchQuery, pageSize, sortBy, sortOrder }}
	onNavigate={navigateTo} />
```

**Key principles:**

- Pass the whole `paginationSettings` object (don't extract properties)
- Bundle all URL state in `urlState` object (search, pageSize, sortBy, sortOrder)
- Component internally handles URL building and first-item preservation on page size changes
- Only `itemType` and `basePath` differ per page

### Search with debouncing

```typescript
import debounce from 'debounce';

const performSearch = debounce(executeSearch, 300);

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    performSearch.clear();
    executeSearch();
  }
}
```

### Loading states

Track navigation changes using the centralized `isNavigationInProgress` utility:

```typescript
import { navigating } from '$app/state';
import { isNavigationInProgress } from '$lib/utils/navigate';

const changeInProgress = $derived(isNavigationInProgress(navigating));
```

This checks if any of the common table params (search, pageSize, sortBy, sortOrder) changed during navigation. Show loading overlay:

```svelte
{#if changeInProgress}
	<div class="absolute inset-0 z-10 bg-white/50 backdrop-blur-[0.5px]"></div>
{/if}
```

## File Organization

```
src/
├── lib/
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn-svelte components
│   │   └── layout/          # AppSidebar, Header
│   ├── constants/           # DEFAULT_PAGE_SIZE, ALLOWED_PAGE_SIZES
│   ├── hooks/               # Rune-based state classes (.svelte.ts)
│   ├── schemas/             # Zod schemas for MongoDB data validation
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Shared utilities (navigate, date, keyboard)
│   ├── database.types.ts    # Generated Supabase types
│   └── supabase.ts          # Supabase client singleton
├── routes/                  # SvelteKit pages
│   ├── contacts/
│   │   ├── +page.server.ts  # Data loading
│   │   ├── +page.svelte     # UI with TanStack Table
│   │   └── [id]/[slug]/     # Dynamic routes
│   └── offices/, projects/, etc.
└── app.css                  # Tailwind v4 imports

supabase/
├── schema.sql               # Full schema definition
├── seed.sql                 # Sample data
├── migrations/              # Incremental schema changes
└── SCHEMA_GUIDE.md          # Schema documentation

scripts/
└── migrate-*.ts             # One-time migration scripts
```

## Common Gotchas

1. **Don't use Svelte 4 patterns**: No `let x = 0; $: y = x * 2`. Use `$state` and `$derived`.
2. **Server-side sorting/filtering**: Don't rely on TanStack Table for sorting/filtering data—do it in Supabase queries.
3. **URL state is source of truth**: Always read pagination/search/sort from `url.searchParams` in `+page.server.ts`.
4. **Preserve all URL params**: When navigating, maintain existing params unless explicitly changing them.
5. **Use typed Supabase client**: Import `Database` types for full type safety.
6. **shadcn-svelte components**: Import from `$lib/components/ui/`, not directly from `bits-ui`.
