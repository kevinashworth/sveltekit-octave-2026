<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { ALLOWED_PAGE_SIZES } from '$lib/constants/pagination';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		pageSize: number;
		totalCount: number;
		itemType: string;
		urlFor: (params: { page?: number; pageSize?: number }) => string;
		onPageSizeChange: (newPageSize: number) => void;
	}

	let { currentPage, totalPages, pageSize, totalCount, itemType, urlFor, onPageSizeChange }: Props =
		$props();

	function handlePageSizeChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const newPageSize = parseInt(select.value);
		onPageSizeChange(newPageSize);
	}

	const startIndex = $derived((currentPage - 1) * pageSize + 1);
	const endIndex = $derived(Math.min(currentPage * pageSize, totalCount));
</script>

<div class="flex w-full items-center justify-between gap-4">
	<!-- Showing count -->
	<div class="text-sm whitespace-nowrap text-surface-600-400">
		Showing {startIndex} to {endIndex} of {totalCount}
		{totalCount === 1 ? itemType : `${itemType}s`}
	</div>

	<!-- Page size selector -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-surface-600-400">Show</span>
		<label>
			<span class="sr-only">Page Size</span>
			<select value={pageSize} onchange={handlePageSizeChange} class="select w-fit text-sm">
				{#each ALLOWED_PAGE_SIZES as size (size)}
					<option
						value={size}
						title="show {size} {size === 1 ? itemType : `${itemType}s`} per page"
					>
						{size}
					</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Pagination -->
	<div class="rounded-container preset-outlined-surface-200-800 p-2">
		<div class="flex gap-2">
			<!-- Previous button -->
			{#if currentPage > 1}
				<a
					href={urlFor({ page: currentPage - 1 })}
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
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
					{#if pageNum === currentPage}
						<button class="btn preset-filled btn-sm" disabled>
							{pageNum}
						</button>
					{:else if Math.abs(pageNum - currentPage) <= 2 || pageNum === 1 || pageNum === totalPages}
						<a href={urlFor({ page: pageNum })} class="btn preset-tonal btn-sm">
							{pageNum}
						</a>
					{:else if pageNum === 2 || pageNum === totalPages - 1}
						<span class="btn preset-tonal btn-sm">...</span>
					{/if}
				{/each}
			</div>

			<!-- Next button -->
			{#if currentPage < totalPages}
				<a
					href={urlFor({ page: currentPage + 1 })}
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
