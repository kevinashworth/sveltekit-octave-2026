<script lang="ts">
	import * as ButtonGroup from '$lib/components/ui/button-group/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';
	import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	import { queryParameters } from 'sveltekit-search-params';

	interface Props {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		itemType: string;
		urlFor: (params: { page?: number; pageSize?: number }) => string;
		onPageSizeChange: (newPageSize: number) => void;
	}

	let { currentPage, totalPages, totalCount, itemType, urlFor, onPageSizeChange }: Props = $props();

	function handlePageSizeChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const newPageSize = parseInt(select.value);
		onPageSizeChange(newPageSize);
	}

	const params = queryParameters({
		pageSize: {
			encode: (value: number) => value.toString(),
			decode: (value: string | null) => (value ? parseInt(value) : null),
			defaultValue: DEFAULT_PAGE_SIZE
		}
	});
	const pageSize = $derived(params.pageSize);
	const startIndex = $derived((currentPage - 1) * pageSize + 1);
	const endIndex = $derived(Math.min(currentPage * pageSize, totalCount));
</script>

<div class="flex w-full items-center justify-between gap-4">
	<!-- Showing count -->
	<div class="rounded-md border p-3.5">
		<div class="text-surface-600-400 text-sm whitespace-nowrap">
			Showing {startIndex} to {endIndex} of {totalCount}
			{totalCount === 1 ? itemType : `${itemType}s`}
		</div>
	</div>

	<!-- Page size selector -->
	<div class="rounded-md border p-3">
		<div class="flex items-center gap-2">
			<span class="text-surface-600-400 text-sm">Show</span>
			<label>
				<span class="sr-only">Page Size</span>
				<select value={pageSize} onchange={handlePageSizeChange} class="select w-fit text-sm">
					{#each ALLOWED_PAGE_SIZES as size (size)}
						<option
							value={size}
							title="show {size} {size === 1 ? itemType : `${itemType}s`} per page">
							{size}
						</option>
					{/each}
				</select>
			</label>
		</div>
	</div>

	<!-- Pagination -->
	<div class="rounded-md border p-2">
		<div class="flex gap-2">
			<!-- Page numbers -->
			<ButtonGroup.Root>
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
					{#if pageNum === currentPage}
						<Button disabled size="icon-sm">
							{pageNum}
						</Button>
					{:else if Math.abs(pageNum - currentPage) <= 2 || pageNum === 1 || pageNum === totalPages}
						<Button href={urlFor({ page: pageNum })} size="icon-sm" variant="outline">
							{pageNum}
						</Button>
					{:else if pageNum === 2 || pageNum === totalPages - 1}
						<Button size="icon-sm" variant="outline">...</Button>
					{/if}
				{/each}
			</ButtonGroup.Root>

			<ButtonGroup.Root>
				<!-- Previous button -->
				{#if currentPage > 1}
					<Button href={urlFor({ page: currentPage - 1 })} size="icon-sm" variant="outline">
						<ArrowLeftIcon class="size-4" />
					</Button>
				{:else}
					<Button disabled size="icon-sm" variant="outline">
						<ArrowLeftIcon class="size-4" />
					</Button>
				{/if}
				<!-- Next button -->
				{#if currentPage < totalPages}
					<Button href={urlFor({ page: currentPage + 1 })} size="icon-sm" variant="outline">
						<ArrowRightIcon class="size-4" />
					</Button>
				{:else}
					<Button disabled size="icon-sm" variant="outline">
						<ArrowRightIcon class="size-4" />
					</Button>
				{/if}
			</ButtonGroup.Root>
		</div>
	</div>
</div>
