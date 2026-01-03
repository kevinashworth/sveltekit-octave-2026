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
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { writable } from 'svelte/store';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import DateCell from '$lib/components/DateCell.svelte';
	import NoteCell from '$lib/components/NoteCell.svelte';
	import TablePaginationControls from '$lib/components/TablePaginationControls.svelte';
	import { DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
	import { formatDate } from '$lib/utils/date';
	import { getModifierKeyPrefix } from '$lib/utils/keyboard';
	import type { PageData } from './$types';

	type Project = PageData['projects'][number];

	let { data }: { data: PageData } = $props();
	const projects = $derived(data.projects);
	const length = $derived(data.projects.length);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);
	const pageSize = $derived(data.pageSize);

	const sortBy = $derived(data.sortBy ?? 'updated_at');
	const sortOrder = $derived(data.sortOrder ?? 'desc');
	const modifierKeyPrefix = getModifierKeyPrefix();
	const searchQuery = $derived(data.search ?? '');
	let searchInput = $derived(searchQuery);

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

	/**
	 * Build a URL with the given search parameters
	 */
	function urlFor(params: {
		page?: number;
		search?: string;
		pageSize?: number;
		sortBy?: string;
		sortOrder?: string;
	}): string {
		const searchParams = new SvelteURLSearchParams();

		// Use provided search or fallback to current search
		const searchValue = params.search !== undefined ? params.search : searchQuery;
		if (searchValue) searchParams.set('search', searchValue);

		// Use provided page or fallback to current page
		const pageValue = params.page !== undefined ? params.page : paginationSettings.page;
		searchParams.set('page', String(pageValue));

		// Use provided pageSize or fallback to current pageSize
		const pageSizeValue = params.pageSize !== undefined ? params.pageSize : pageSize;
		if (pageSizeValue !== DEFAULT_PAGE_SIZE) {
			searchParams.set('pageSize', String(pageSizeValue));
		}

		// Use provided sort or fallback to current sort
		const sortByValue = params.sortBy !== undefined ? params.sortBy : sortBy;
		if (sortByValue !== 'updated_at') {
			searchParams.set('sortBy', sortByValue);
		}

		const sortOrderValue = params.sortOrder !== undefined ? params.sortOrder : sortOrder;
		if (sortOrderValue !== 'desc') {
			searchParams.set('sortOrder', sortOrderValue);
		}

		return `/projects?${searchParams.toString()}`;
	}

	/**
	 * Navigate to a URL with the given parameters.
	 * Automatically preserves current state (pageSize, sort, search) unless explicitly overridden.
	 */
	async function navigateTo(
		params: {
			page?: number;
			search?: string;
			pageSize?: number;
			sortBy?: string;
			sortOrder?: string;
		},
		options: { keepFocus?: boolean } = {}
	) {
		// Always include current pageSize unless explicitly provided
		const finalParams = {
			pageSize: pageSize,
			...params
		};
		const url = urlFor(finalParams);
		await goto(url, options); // eslint-disable-line svelte/no-navigation-without-resolve
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

	$effect(() => {
		if (!browser) return;

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

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

	// Column definitions
	const columns: ColumnDef<Project>[] = [
		{
			accessorKey: 'project_title',
			header: 'Project Title',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'casting_company',
			header: 'Casting Company',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'network',
			header: 'Network',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'project_type',
			header: 'Type',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'shooting_location',
			header: 'Shooting Location',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'html_notes',
			header: 'Notes',
			// enableSorting: false,
			// sortingFn: 'basic',
			// sortUndefined: 'last',
			cell: (info) => {
				const props = {
					value: info.getValue<string | null>(),
					id: info.row.original.id,
					project_title: info.row.original.project_title
				};
				return renderComponent(NoteCell, props);
			}
		},
		{
			accessorKey: 'status',
			header: 'Status',
			sortingFn: 'alphanumeric'
		},
		{
			accessorKey: 'created_at',
			header: 'Created',
			sortingFn: 'datetime',
			cell: (info) => formatDate(info.getValue<string>())
		},
		{
			accessorKey: 'updated_at',
			header: 'Updated',
			sortingFn: 'datetime',
			cell: (info) => formatDate(info.getValue<string | null>())
		}
	];

	const tableOptions = $derived.by(() => {
		return writable<TableOptions<Project>>({
			data: projects as Project[],
			columns,
			state: {
				sorting
			},

			manualSorting: true,
			getCoreRowModel: getCoreRowModel()
		});
	});

	const table = $derived(createSvelteTable(tableOptions));
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<h1>Projects</h1>
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
				placeholder="Search projects..."
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

	{#if length === 0}
		<div class="variant-soft-warning alert">
			<div>
				<strong>No projects found</strong>
			</div>
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
										{@const isNoteColumn = header.column.id === 'html_notes'}
										<th class="group">
											<button
												type="button"
												class:cursor-pointer={canSort}
												class:select-none={canSort}
												onclick={() => canSort && handleSort(header.column.id)}
												class="inline-flex items-center font-semibold"
												><Component />
												{#if isDateColumn || isNoteColumn}
													{#if sortState === 'asc'}
														<ArrowUpIcon class="text-secondary-500 ml-1 inline h-6 w-6" />
													{:else if sortState === 'desc'}
														<ArrowDownIcon class="text-secondary-500 ml-1 inline h-6 w-6" />
													{:else if canSort}
														<ArrowDownIcon
															class="ml-1 inline h-6 w-6 opacity-0 group-hover:opacity-30" />
													{/if}
												{:else if sortState === 'asc'}
													<ArrowDownAZIcon class="text-secondary-500 ml-1 inline h-6 w-6" />
												{:else if sortState === 'desc'}
													<ArrowUpZAIcon class="text-secondary-500 ml-1 inline h-6 w-6" />
												{:else if canSort}
													<ArrowDownAZIcon
														class="ml-1 inline h-6 w-6 opacity-0 group-hover:opacity-30" />
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
								<th>Project Title</th>
								<th>Casting Company</th>
								<th>Network</th>
								<th>Type</th>
								<th>Shooting Location</th>
								<th>Notes</th>
								<th>Status</th>
								<th>Created</th>
								<th>Updated</th>
							</tr>
						</thead>
						<tbody class="[&>tr]:hover:bg-gray-200">
							{#each projects as project, i (project.id)}
								<tr class:bg-gray-100={i % 2 === 0}>
									<td>{project.project_title}</td>
									<td>{project.casting_company ?? ''}</td>
									<td>{project.network ?? ''}</td>
									<td>{project.project_type ?? ''}</td>
									<td>{project.shooting_location ?? ''}</td>
									<td>
										<NoteCell value={project.html_notes} project_title={project.project_title} />
									</td>
									<td>{project.status ?? ''}</td>
									<td>
										<DateCell value={project.created_at} />
									</td>
									<td>
										<DateCell value={project.updated_at} />
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			<TablePaginationControls
				currentPage={paginationSettings.page}
				totalPages={paginationSettings.amount}
				{totalCount}
				itemType="project"
				{urlFor}
				onPageSizeChange={async (newPageSize) => {
					const firstProjectIndex = (paginationSettings.page - 1) * pageSize;
					const newPage = Math.floor(firstProjectIndex / newPageSize) + 1;
					await navigateTo({ pageSize: newPageSize, page: newPage });
				}} />
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
