<script lang="ts">
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { rankItem } from '@tanstack/match-sorter-utils';
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getFilteredRowModel
	} from '@tanstack/svelte-table';
	import type { ColumnDef, FilterFn, TableOptions } from '@tanstack/svelte-table';
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

	let globalFilter = '';

	// see https://tanstack.com/table/latest/docs/framework/svelte/examples/filtering
	const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
		// If no search term, show all rows
		if (!value) {
			return true;
		}

		const itemValue = row.getValue(columnId);

		// If column is empty but we're searching for something, don't match this column
		if (itemValue == null || itemValue === '') {
			return false;
		}

		const itemRank = rankItem(String(itemValue), value);
		addMeta({ itemRank });
		return itemRank.passed;
	};

	let columns: ColumnDef<Partial<Contact>>[] = [
		{
			accessorKey: 'firstName',
			header: 'First Name',
			filterFn: fuzzyFilter
		},
		{
			accessorKey: 'lastName',
			header: 'Last Name',
			filterFn: fuzzyFilter
		},
		{
			accessorKey: 'addressString',
			header: 'Address String',
			filterFn: fuzzyFilter
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
			},
			filterFn: fuzzyFilter
		}
	];

	// const table = createSvelteTable({
	// 	data: contacts,
	// 	columns: columnDefs,
	// 	getCoreRowModel: getCoreRowModel()
	// });

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
			// state: {
			// 	globalFilter
			// },
			// onGlobalFilterChange: (updater) => {
			// 	globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
			// },
			filterFns: {
				fuzzy: fuzzyFilter
			},
			getCoreRowModel: getCoreRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			globalFilterFn: 'fuzzy'
		});
	});

	function getPageUrl(pageNum: number): string {
		const url = new URL(window.location.href);
		url.searchParams.set('page', String(pageNum));
		return url.pathname + url.search;
	}

	function handleKeyUp(e: any) {
		$table.setGlobalFilter(String(e?.target?.value));
	}

	// Pagination button classes
	const baseButtonClasses = 'inline-flex h-6 items-center justify-center rounded px-2 text-sm';
	const activeButtonClasses = `${baseButtonClasses} bg-blue-600 text-white font-bold cursor-default`;
	const inactiveButtonClasses = `${baseButtonClasses} bg-gray-200 transition-colors hover:bg-gray-300`;
	const disabledButtonClasses = `${baseButtonClasses} bg-gray-200 text-gray-600 cursor-not-allowed`;
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1>Contacts</h1>
		<pre>"globalFilter": "{$table.getState().globalFilter}"</pre>
		<input
			type="text"
			placeholder="Search contacts..."
			bind:value={globalFilter}
			onkeyup={handleKeyUp}
			class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
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
								href={getPageUrl(paginationSettings.page - 1)}
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
										href={getPageUrl(pageNum)}
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
								href={getPageUrl(paginationSettings.page + 1)}
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
