<script lang="ts">
	import {
		ArrowDownAZIcon,
		ArrowDownIcon,
		ArrowUpIcon,
		ArrowUpZAIcon,
		CircleXIcon,
		SearchIcon
	} from '@lucide/svelte';
	import type { ColumnDef, SortingState, TableOptions } from '@tanstack/svelte-table';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		renderComponent
	} from '@tanstack/svelte-table';
	import debounce from 'debounce';
	import { writable } from 'svelte/store';

	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import ContactCell from '$lib/components/ContactCell.svelte';
	import DateCell from '$lib/components/DateCell.svelte';
	import TablePaginationControls from '$lib/components/TablePaginationControls.svelte';
	import { formatDate } from '$lib/utils/date';
	import { getModifierKeyPrefix } from '$lib/utils/keyboard';
	import {
		navigateTo as navigateToUtil,
		type GoToOptions,
		type SearchParamValues
	} from '$lib/utils/navigate';
	import type { PageData } from './$types';

	type Contact = PageData['contacts'][number];

	let { data }: { data: PageData } = $props();
	const contacts = $derived(data.contacts);
	const length = $derived(data.contacts.length);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);
	const pageSize = $derived(data.pageSize);

	const searchQuery = $derived(data.search ?? '');
	const modifierKeyPrefix = getModifierKeyPrefix();
	let searchInput = $derived(searchQuery);

	const sortBy = $derived(data.sortBy ?? 'updated_at');
	const sortOrder = $derived(data.sortOrder ?? 'desc');
	const sorting = $derived<SortingState>([{ id: sortBy, desc: sortOrder === 'desc' }]);

	// Track if we're loading from a search, page size, or sort change
	const changeInProgress = $derived(
		!!navigating &&
			(navigating.from?.url.searchParams.get('search') !==
				navigating.to?.url.searchParams.get('search') ||
				navigating.from?.url.searchParams.get('pageSize') !==
					navigating.to?.url.searchParams.get('pageSize') ||
				navigating.from?.url.searchParams.get('sortBy') !==
					navigating.to?.url.searchParams.get('sortBy') ||
				navigating.from?.url.searchParams.get('sortOrder') !==
					navigating.to?.url.searchParams.get('sortOrder'))
	);

	let searchInputElement: HTMLInputElement;

	async function navigateTo(params: SearchParamValues, options: GoToOptions = {}) {
		await navigateToUtil(
			params,
			{ search: searchQuery, page: paginationSettings.page, pageSize, sortBy, sortOrder },
			'/contacts',
			options
		);
	}

	// Immediate search function
	async function executeSearch() {
		await navigateTo({ search: searchInput, page: 1 }, { keepFocus: true });
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

	// Handle server-side sorting
	async function handleSort(columnId: string) {
		const currentSort = sorting[0];
		let newSortOrder: string;

		if (currentSort?.id === columnId) {
			// Toggle between asc and desc
			newSortOrder = currentSort.desc ? 'asc' : 'desc';
		} else {
			// Default direction depends on column type: date columns default to desc, others to asc
			const colDef = columns.find((c) => 'accessorKey' in c && c.accessorKey === columnId);
			const sortingFn = colDef?.sortingFn;
			newSortOrder = sortingFn === 'datetime' ? 'desc' : 'asc';
		}

		await navigateTo({ sortBy: columnId, sortOrder: newSortOrder, page: 1 });
	}

	$effect(() => {
		if (!browser) return;

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	const columns: ColumnDef<Contact>[] = [
		{
			accessorKey: 'first_name',
			header: 'Name',
			cell: (info) => {
				const props = {
					id: info.row.original.id,
					slug: info.row.original.slug,
					first: info.getValue<string | null>(),
					last: info.row.original.last_name
				};
				return renderComponent(ContactCell, props);
			},
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
			cell: (info) => formatDate(info.getValue<string | null>())
		}
	];

	const tableOptions = $derived.by(() => {
		return writable<TableOptions<Contact>>({
			columns,
			data: contacts,
			enableSortingRemoval: false, // because Last Updated is always sorted
			getCoreRowModel: getCoreRowModel(),
			manualSorting: true,
			state: {
				sorting
			}
		});
	});

	const table = $derived(createSvelteTable(tableOptions));
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<h1>Contacts</h1>
		<div class="relative max-w-sm flex-1">
			<div
				class="pointer-events-none absolute top-1/2 right-3 left-3 -translate-y-1/2 text-gray-400">
				{#if changeInProgress}
					<div
						class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent">
					</div>
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
				type="text" />
			<div
				class="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-xs text-gray-400">
				{#if !searchInput}
					<span>{modifierKeyPrefix}</span>
					<span>/</span>
				{/if}
			</div>
			{#if searchInput}
				<button
					class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					onclick={clearSearch}
					title="Clear search">
					<CircleXIcon class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>

	{#if data.error}
		<div>
			<strong>Error:</strong>
			{data.error}
		</div>
	{:else if length === 0}
		<div>
			<strong>No contacts found</strong>
		</div>
	{:else}
		<div class="space-y-4">
			<!-- Table -->
			<div class="relative rounded-md border border-gray-200">
				<!-- Loading overlay -->
				{#if changeInProgress}
					<div class="absolute inset-0 z-10 bg-white/50 backdrop-blur-[0.5px] transition-opacity">
					</div>
				{/if}
				{#if browser && table}
					<!-- Client-side rendered table with TanStack Table -->
					<table class="table w-full">
						<thead>
							{#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<tr>
									{#each headerGroup.headers as header (header.id)}
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
												onclick={() => canSort && handleSort(header.column.id)}
												class="inline-flex items-center font-semibold"
												><Component />
												{#if isDateColumn}
													{#if sortState === 'asc'}
														<ArrowUpIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
													{:else if sortState === 'desc'}
														<ArrowDownIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
													{:else if canSort}
														<ArrowDownIcon
															class="ml-1 inline h-4 w-4 opacity-0 group-hover:opacity-30" />
													{/if}
												{:else if sortState === 'asc'}
													<ArrowDownAZIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
												{:else if sortState === 'desc'}
													<ArrowUpZAIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
												{:else if canSort}
													<ArrowDownAZIcon
														class="ml-1 inline h-4 w-4 opacity-0 group-hover:opacity-30" />
												{/if}
											</button>
										</th>
									{/each}
								</tr>
							{/each}
						</thead>
						<tbody class="[&>tr]:hover:bg-gray-200">
							{#each $table.getRowModel().rows as row, i (row.id)}
								<tr class:bg-gray-100={i % 2 === 0}>
									{#each row.getVisibleCells() as cell (cell.id)}
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
					<table class="table w-full">
						<thead>
							<tr>
								<th>Name</th>
								<th>Address</th>
								<th
									>Last Updated <ArrowDownIcon
										class="text-secondary-500 ml-1 inline h-4 w-4" /></th>
							</tr>
						</thead>
						<tbody class="[&>tr]:hover:bg-gray-200">
							{#each contacts as contact, i (contact.id)}
								<tr class:bg-gray-100={i % 2 === 0}>
									<td>
										<a
											class="text-blue-600 hover:underline"
											href={resolve(`/contacts/${contact.id}/${contact.slug}`)}>
											{contact.first_name}&nbsp;{contact.last_name}
										</a>
									</td>
									<td>{contact.address_string}</td>
									<td>
										<DateCell value={contact.updated_at} />
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			<TablePaginationControls
				{paginationSettings}
				{totalCount}
				itemType="contact"
				basePath="/contacts"
				urlState={{ search: searchQuery, pageSize, sortBy, sortOrder }}
				onNavigate={navigateTo} />
			<!-- <pre>{JSON.stringify($table.getState().sorting, null, 2)}</pre> -->
		</div>
	{/if}
</div>

<style>
	td,
	th {
		font-size: smaller;
		padding: 0.25rem;
		text-align: left;
	}
</style>
