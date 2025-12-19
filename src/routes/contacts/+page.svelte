<script lang="ts">
	import { ArrowLeftIcon, ArrowRightIcon, CircleXIcon, SearchIcon } from '@lucide/svelte';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/svelte-table';
	import debounce from 'debounce';
	import { writable } from 'svelte/store';

	import { goto } from '$app/navigation';
	import { getModifierKeyPrefix } from '$lib/utils/keyboard';
	import type { Database } from '$lib/database.types';

	import type { PageData } from './$types';

	type DbContact = Database['public']['Tables']['contacts']['Row'];
	type PartialDbContact = Partial<DbContact>;

	let { data }: { data: PageData } = $props();
	$inspect('Page data:', data);
	const contacts = $derived(data.contacts);
	const length = $derived(data.contacts.length);
	const pageSize = $derived(data.pageSize);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);

	const searchQuery = $derived(data.search ?? '');
	const modifierKeyPrefix = getModifierKeyPrefix();
	let searchInput = $state('');

	// Sync searchInput with searchQuery when it changes
	$effect(() => {
		searchInput = searchQuery;
	});
	let searchInputElement: HTMLInputElement;

	// Debounced search function
	const performSearch = debounce(async () => {
		const url = new URL(window.location.href);
		if (searchInput) {
			url.searchParams.set('search', searchInput);
		} else {
			url.searchParams.delete('search');
		}
		url.searchParams.set('page', '1');
		await goto(url.pathname + url.search);
		searchInputElement?.focus();
	}, 300);

	function clearSearch() {
		searchInput = '';
		performSearch();
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
			e.preventDefault();
			searchInputElement?.select();
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
		window.addEventListener('keydown', handleGlobalKeydown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	const columns: ColumnDef<PartialDbContact>[] = [
		{
			accessorKey: 'first_name',
			header: 'First Name'
		},
		{
			accessorKey: 'last_name',
			header: 'Last Name'
		},
		{
			accessorKey: 'address_string',
			header: 'Address'
		},
		{
			accessorKey: 'updated_at',
			header: 'Last Updated',
			cell: (info) => {
				const date = info.getValue<Date | undefined>();
				if (!date) return 'N/A';
				const dateObj = date instanceof Date ? date : new Date(date);
				return dateObj.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				});
			}
		}
	];

	let tableOptions = writable<TableOptions<PartialDbContact>>({
		data: [],
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	const table = createSvelteTable(tableOptions);

	// Update table options whenever contacts change
	$effect(() => {
		tableOptions.set({
			data: contacts,
			columns,
			getCoreRowModel: getCoreRowModel()
		});
	});

	function getPageUrl(pageNum: number, search?: string): string {
		const url = new URL(window.location.href);
		url.searchParams.set('page', String(pageNum));
		if (search) {
			url.searchParams.set('search', search);
		} else {
			url.searchParams.delete('search');
		}
		return url.pathname + url.search;
	}

	// Pagination button classes
	const baseButtonClasses = 'inline-flex h-6 items-center justify-center rounded px-2 text-sm';
	const activeButtonClasses = `${baseButtonClasses} bg-blue-600 text-white font-bold cursor-default`;
	const inactiveButtonClasses = `${baseButtonClasses} bg-gray-200 transition-colors hover:bg-gray-300`;
	const disabledButtonClasses = `${baseButtonClasses} bg-gray-200 text-gray-600 cursor-not-allowed`;
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-4">
		<h1>Contacts</h1>
		<div class="relative max-w-sm flex-1">
			<div
				class="pointer-events-none absolute top-1/2 right-3 left-3 -translate-y-1/2 text-gray-400"
			>
				<SearchIcon class="h-4 w-4" />
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
			<div class="table-container">
				<table class="table-hover table">
					<thead>
						{#each $table.getHeaderGroups() as headerGroup}
							<tr>
								{#each headerGroup.headers as header}
									<th>
										<div>
											{header.column.columnDef.header}
										</div>
									</th>
								{/each}
							</tr>
						{/each}
					</thead>
					<tbody>
						{#each $table.getRowModel().rows as row}
							<tr>
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
			</div>

			<!-- Pagination -->
			<div class="flex items-center justify-between">
				<div class="text-sm text-surface-600">
					Showing {(paginationSettings.page - 1) * pageSize + 1} to {Math.min(
						paginationSettings.page * pageSize,
						totalCount
					)} of {totalCount} contacts
				</div>

				<div class="rounded border border-gray-400 p-2">
					<div class="flex items-center gap-2">
						<!-- Previous button -->
						{#if paginationSettings.page > 1}
							<a
								href={getPageUrl(paginationSettings.page - 1, searchQuery)}
								data-sveltekit-prefetch
								class={inactiveButtonClasses}
								title="Previous page"
							>
								<ArrowLeftIcon class="size-4" />
							</a>
						{:else}
							<button class={disabledButtonClasses} disabled>
								<ArrowLeftIcon class="size-4" />
							</button>
						{/if}

						<!-- Page numbers -->
						<div class="flex gap-1">
							{#each Array.from({ length: paginationSettings.amount }, (_, i) => i + 1) as pageNum}
								{#if pageNum === paginationSettings.page}
									<button class={activeButtonClasses} disabled>
										{pageNum}
									</button>
								{:else if Math.abs(pageNum - paginationSettings.page) <= 2 || pageNum === 1 || pageNum === paginationSettings.amount}
									<a
										href={getPageUrl(pageNum, searchQuery)}
										data-sveltekit-prefetch
										class={inactiveButtonClasses}
									>
										{pageNum}
									</a>
								{:else if pageNum === 2 || pageNum === paginationSettings.amount - 1}
									<span class="inline-flex h-6 items-center justify-center px-2 text-sm">...</span>
								{/if}
							{/each}
						</div>

						<!-- Next button -->
						{#if paginationSettings.page < paginationSettings.amount}
							<a
								href={getPageUrl(paginationSettings.page + 1, searchQuery)}
								data-sveltekit-prefetch
								class={inactiveButtonClasses}
								title="Next page"
							>
								<ArrowRightIcon class="size-4" />
							</a>
						{:else}
							<button class={disabledButtonClasses} disabled>
								<ArrowRightIcon class="size-4" />
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
