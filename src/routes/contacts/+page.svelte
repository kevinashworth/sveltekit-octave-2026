<script lang="ts">
	import {
		ArrowDownAZIcon,
		ArrowDownIcon,
		ArrowLeftIcon,
		ArrowRightIcon,
		ArrowUpIcon,
		ArrowUpZAIcon,
		CircleXIcon,
		SearchIcon
	} from '@lucide/svelte';
	import type { ColumnDef, OnChangeFn, SortingState, TableOptions } from '@tanstack/svelte-table';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getSortedRowModel
	} from '@tanstack/svelte-table';
	import debounce from 'debounce';
	import { writable } from 'svelte/store';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
	import type { Database } from '$lib/database.types';
	import { getModifierKeyPrefix } from '$lib/utils/keyboard';
	import type { PageData } from './$types';

	type DbContact = Database['public']['Tables']['contacts']['Row'];
	type PartialDbContact = Partial<DbContact>;

	let { data }: { data: PageData } = $props();
	const contacts = $derived(data.contacts);
	const length = $derived(data.contacts.length);
	const pageSize = $derived(data.pageSize);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);

	const searchQuery = $derived(data.search ?? '');
	const modifierKeyPrefix = getModifierKeyPrefix();
	let searchInput = $state('');

	let sorting = $state<SortingState>([{ id: 'updated_at', desc: true }]);

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
	};

	// Track if we're loading from a search or page size change
	const changeInProgress = $derived(
		!!navigating &&
			(navigating.from?.url.searchParams.get('search') !==
				navigating.to?.url.searchParams.get('search') ||
				navigating.from?.url.searchParams.get('pageSize') !==
					navigating.to?.url.searchParams.get('pageSize'))
	);

	// Sync searchInput with searchQuery when it changes
	$effect(() => {
		searchInput = searchQuery;
	});
	let searchInputElement: HTMLInputElement;

	/**
	 * Centralized navigation helper to maintain search params and page size
	 */
	async function navigate(
		params: { page?: number; search?: string; pageSize?: number },
		options: { keepFocus?: boolean } = {}
	) {
		const searchParams = new URLSearchParams(page.url.searchParams);

		if (params.search !== undefined) {
			if (params.search) searchParams.set('search', params.search);
			else searchParams.delete('search');
		}

		if (params.pageSize !== undefined) {
			if (params.pageSize !== DEFAULT_PAGE_SIZE)
				searchParams.set('pageSize', String(params.pageSize));
			else searchParams.delete('pageSize');
		}

		if (params.page !== undefined) {
			searchParams.set('page', String(params.page));
		}

		await goto(`?${searchParams.toString()}`, options);
	}

	// Immediate search function
	async function executeSearch() {
		await navigate({ search: searchInput, page: 1 }, { keepFocus: true });
	}

	// Debounced search function
	const performSearch = debounce(executeSearch, 300);

	function clearSearch() {
		searchInput = '';
		performSearch();
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
			e.preventDefault();
			searchInputElement?.select();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			performSearch.clear();
			executeSearch();
		}
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		// Cmd+/ or Ctrl+/ to focus search
		if ((e.metaKey || e.ctrlKey) && e.key === '/') {
			e.preventDefault();
			searchInputElement?.focus();
		}
	}

	$effect(() => {
		if (!browser) return;

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	const columns: ColumnDef<PartialDbContact>[] = [
		{
			accessorKey: 'first_name',
			header: 'First Name',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'last_name',
			header: 'Last Name',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'address_string',
			header: 'Address',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'updated_at',
			header: 'Last Updated',
			sortingFn: 'datetime',
			cell: (info) => {
				const date = info.getValue<string | null>();
				if (!date) return 'N/A';
				return new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				});
			}
		}
	];

	const tableOptions = $derived.by(() => {
		return writable<TableOptions<PartialDbContact>>({
			data: contacts,
			columns,
			state: {
				sorting
			},
			getCoreRowModel: getCoreRowModel(),
			getSortedRowModel: getSortedRowModel(),
			onSortingChange: setSorting
		});
	});

	const table = $derived(createSvelteTable(tableOptions));

	function getPageUrl(pageNum: number, search?: string): string {
		const params = new URLSearchParams();
		params.set('page', String(pageNum));

		if (search) params.set('search', search);

		if (pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(pageSize));

		return `/contacts?${params.toString()}`;
	}

	async function handlePageSizeChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const newPageSize = parseInt(select.value);
		// Calculate the index of the first contact on the current page
		const firstContactIndex = (paginationSettings.page - 1) * pageSize;
		// Calculate which page in the new size would contain that contact
		const newPage = Math.floor(firstContactIndex / newPageSize) + 1;

		await navigate({ pageSize: newPageSize, page: newPage });
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<h1>Contacts</h1>
		<div class="relative max-w-sm flex-1">
			<div
				class="pointer-events-none absolute top-1/2 right-3 left-3 -translate-y-1/2 text-gray-400"
			>
				{#if changeInProgress}
					<div
						class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
					></div>
				{:else}
					<SearchIcon class="h-4 w-4" />
				{/if}
			</div>
			<input
				bind:this={searchInputElement}
				bind:value={searchInput}
				class="w-full rounded-md border border-gray-300 py-2 pr-12 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
				oninput={performSearch}
				onkeydown={handleSearchKeydown}
				placeholder="Search contacts..."
				type="text"
			/>
			<div
				class="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-xs text-gray-400"
			>
				{#if !searchInput}
					<span>{modifierKeyPrefix}</span>
					<span>/</span>
				{/if}
			</div>
			{#if searchInput}
				<button
					class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					onclick={clearSearch}
					title="Clear search"
				>
					<CircleXIcon class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>

	{#if data.error}
		<div class="variant-soft-error alert">
			<div>
				<strong>Error:</strong>
				{data.error}
			</div>
		</div>
	{:else if length === 0}
		<div class="variant-soft-warning alert">
			<div>
				<strong>No contacts found</strong>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			<!-- Table -->
			<div class="relative table-wrap rounded-md border border-surface-200-800">
				<!-- Loading overlay -->
				{#if changeInProgress}
					<div
						class="absolute inset-0 z-10 bg-white/50 backdrop-blur-[0.5px] transition-opacity"
					></div>
				{/if}
				{#if browser && table}
					<!-- Client-side rendered table with TanStack Table -->
					<table class="table">
						<thead>
							{#each $table.getHeaderGroups() as headerGroup}
								<tr>
									{#each headerGroup.headers as header}
										{@const canSort = header.column.getCanSort()}
										{@const sortState = header.column.getIsSorted()}
										{@const Component = flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
										{@const isDateColumn = header.column.columnDef.sortingFn === 'datetime'}
										<th class="group">
											<button
												type="button"
												class:cursor-pointer={canSort}
												class:select-none={canSort}
												onclick={header.column.getToggleSortingHandler()}
												class="inline-flex items-center font-semibold"
												><Component />
												{#if isDateColumn}
													{#if sortState === 'asc'}
														<ArrowUpIcon class="ml-1 inline h-6 w-6 text-secondary-500" />
													{:else if sortState === 'desc'}
														<ArrowDownIcon class="ml-1 inline h-6 w-6 text-secondary-500" />
													{:else if canSort}
														<ArrowDownIcon
															class="ml-1 inline h-6 w-6 opacity-0 group-hover:opacity-30"
														/>
													{/if}
												{:else if sortState === 'asc'}
													<ArrowDownAZIcon class="ml-1 inline h-6 w-6 text-secondary-500" />
												{:else if sortState === 'desc'}
													<ArrowUpZAIcon class="ml-1 inline h-6 w-6 text-secondary-500" />
												{:else if canSort}
													<ArrowDownAZIcon
														class="ml-1 inline h-6 w-6 opacity-0 group-hover:opacity-30"
													/>
												{/if}
											</button>
										</th>
									{/each}
								</tr>
							{/each}
						</thead>
						<tbody>
							{#each $table.getRowModel().rows as row, i}
								<tr class:bg-surface-100={i % 2 === 0}>
									{#each row.getVisibleCells() as cell}
										{@const Component = flexRender(cell.column.columnDef.cell, cell.getContext())}
										<td>
											<Component />
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<!-- Server-side rendered table (fallback for SSR or when browser is false) -->
					<table class="table-hover table w-full">
						<thead>
							<tr>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Address</th>
								<th>Updated</th>
							</tr>
						</thead>
						<tbody>
							{#each contacts as contact, i}
								<tr class:bg-surface-100={i % 2 === 0}>
									<td>{contact.first_name}</td>
									<td>{contact.last_name}</td>
									<td>{contact.address_string}</td>
									<td>
										{contact.updated_at
											? new Date(contact.updated_at).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric'
												})
											: 'N/A'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			<div class="flex w-full items-center justify-between gap-4">
				<!-- Page Size  -->
				<div class="text-sm whitespace-nowrap text-surface-600-400">
					Showing {(paginationSettings.page - 1) * pageSize + 1} to {Math.min(
						paginationSettings.page * pageSize,
						totalCount
					)} of {totalCount} contacts
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-surface-600-400">Show</span>
					<select value={pageSize} onchange={handlePageSizeChange} class="select w-fit text-sm">
						{#each ALLOWED_PAGE_SIZES as size}
							<option value={size} title="show {size} contacts per page">{size}</option>
						{/each}
					</select>
				</div>

				<!-- Pagination -->
				<div class="rounded-container preset-outlined-surface-200-800 p-2">
					<div class="flex gap-2">
						<!-- Previous button -->
						{#if paginationSettings.page > 1}
							<a
								href={getPageUrl(paginationSettings.page - 1, searchQuery)}
								data-sveltekit-prefetch
								class="btn preset-tonal btn-sm"
								title="Previous page"
							>
								<ArrowLeftIcon class="size-4" />
							</a>
						{:else}
							<button class="btn preset-tonal btn-sm opacity-50" disabled>
								<ArrowLeftIcon class="size-4" />
							</button>
						{/if}

						<!-- Page numbers -->
						<div class="flex gap-1">
							{#each Array.from({ length: paginationSettings.amount }, (_, i) => i + 1) as pageNum}
								{#if pageNum === paginationSettings.page}
									<button class="btn preset-filled btn-sm" disabled>
										{pageNum}
									</button>
								{:else if Math.abs(pageNum - paginationSettings.page) <= 2 || pageNum === 1 || pageNum === paginationSettings.amount}
									<a
										href={getPageUrl(pageNum, searchQuery)}
										data-sveltekit-prefetch
										class="btn preset-tonal btn-sm"
									>
										{pageNum}
									</a>
								{:else if pageNum === 2 || pageNum === paginationSettings.amount - 1}
									<span class="btn preset-tonal btn-sm">...</span>
								{/if}
							{/each}
						</div>

						<!-- Next button -->
						{#if paginationSettings.page < paginationSettings.amount}
							<a
								href={getPageUrl(paginationSettings.page + 1, searchQuery)}
								data-sveltekit-prefetch
								class="btn preset-tonal btn-sm"
								title="Next page"
							>
								<ArrowRightIcon class="size-4" />
							</a>
						{:else}
							<button class="btn preset-tonal btn-sm opacity-50" disabled>
								<ArrowRightIcon class="size-4" />
							</button>
						{/if}
					</div>
				</div>
			</div>
			<!-- <pre>{JSON.stringify($table.getState().sorting, null, 2)}</pre> -->
		</div>
	{/if}
</div>
