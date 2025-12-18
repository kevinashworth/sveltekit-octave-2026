<script lang="ts">
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import {
		createColumnHelper,
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		type TableOptions
	} from '@tanstack/svelte-table';
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Contact } from '$lib/schemas';

	let { data }: { data: PageData } = $props();
	$inspect('Page data:', data);
	const contacts = $derived(data.contacts);
	const length = $derived(data.contacts.length);
	// const currentPage = $derived(data.currentPage);
	const pageSize = $derived(data.pageSize);
	const totalCount = $derived(data.totalCount);
	const paginationSettings = $derived(data.paginationSettings);

	let page = $state(data.currentPage);

	const colHelp = createColumnHelper<Partial<Contact>>();

	const columnDefs = [
		colHelp.accessor('firstName', {
			header: 'First Name'
		}),
		colHelp.accessor('lastName', {
			header: 'Last Name'
		}),
		colHelp.accessor('updatedAt', {
			header: 'Last Updated',
			cell: (info) => {
				const date = info.getValue<Date | undefined>();
				if (!date) return 'N/A';
				const dateObj = date instanceof Date ? date : new Date(date);
				return dateObj.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			}
		})
	];

	// const table = createSvelteTable({
	// 	data: contacts,
	// 	columns: columnDefs,
	// 	getCoreRowModel: getCoreRowModel()
	// });

	let tableOptions = writable<TableOptions<Partial<Contact>>>({
		data: contacts,
		columns: columnDefs,
		getCoreRowModel: getCoreRowModel()
	});

	const table = createSvelteTable(tableOptions);

	// Update table options whenever contacts change
	$effect(() => {
		tableOptions.set({
			data: contacts,
			columns: columnDefs,
			getCoreRowModel: getCoreRowModel()
		});
	});

	function onPageChange(event: { page: number }) {
		page = event.page;
		const url = new URL(window.location.href);
		url.searchParams.set('page', String(page));
		goto(url.toString());
	}

	function getPageUrl(pageNum: number): string {
		const url = new URL(window.location.href);
		url.searchParams.set('page', String(pageNum));
		return url.pathname + url.search;
	}

	// Pagination button classes
	const baseButtonClasses = 'inline-flex h-6 items-center justify-center rounded px-1 text-sm';
	const activeButtonClasses = `${baseButtonClasses} bg-blue-600 text-white font-medium cursor-default`;
	const inactiveButtonClasses = `${baseButtonClasses} bg-gray-200 transition-colors hover:bg-gray-300`;
	const disabledButtonClasses = `${baseButtonClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
</script>

<div class="space-y-4">
	<h1 class="h2">Contacts</h1>

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
									<th style="width: {header.getSize()}px">
										{#if !header.isPlaceholder}
											<div>
												{header.column.columnDef.header || ''}
											</div>
										{/if}
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
								<a href={getPageUrl(pageNum)} data-sveltekit-prefetch class={inactiveButtonClasses}>
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
	{/if}
</div>
