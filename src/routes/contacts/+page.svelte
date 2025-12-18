<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/svelte-table';
	import { writable } from 'svelte/store';

	import type { PageData } from './$types';
	import type { Contact } from '$lib/schemas';

	let { data }: { data: PageData } = $props();
	$inspect('Page data:', data);
	const contacts = $derived(data.contacts);
	const length = $derived(data.contacts.length);
	const pageSize = $derived(data.pageSize);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);
	const searchQuery = $derived(data.search ?? '');

	let searchInput = $state(searchQuery);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let searchInputElement: HTMLInputElement;

	// Debounced search function
	function performSearch() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
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
	}

	function clearSearch() {
		searchInput = '';
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			const url = new URL(window.location.href);
			url.searchParams.delete('search');
			url.searchParams.set('page', '1');
			await goto(url.pathname + url.search);
			searchInputElement?.focus();
		}, 300);
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
			e.preventDefault();
			searchInputElement?.select();
		}
	}

	let columns: ColumnDef<Partial<Contact>>[] = [
		{
			accessorKey: 'firstName',
			header: 'First Name'
		},
		{
			accessorKey: 'lastName',
			header: 'Last Name'
		},
		{
			accessorKey: 'addressString',
			header: 'Address String'
		},
		{
			accessorKey: 'updatedAt',
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

	let tableOptions = writable<TableOptions<Partial<Contact>>>({
		data: contacts,
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
			<input
				type="text"
				placeholder="Search contacts..."
				bind:value={searchInput}
				bind:this={searchInputElement}
				oninput={performSearch}
				onkeydown={handleSearchKeydown}
				class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			{#if searchInput}
				<button
					onclick={clearSearch}
					class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					title="Clear search"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
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
