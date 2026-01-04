<script lang="ts">
	import { ArrowDownAZIcon, ArrowDownIcon, ArrowUpIcon, ArrowUpZAIcon } from '@lucide/svelte';
	import type { SortDirection } from '@tanstack/svelte-table';

	interface Props {
		sortState: false | SortDirection;
		isDateColumn: boolean;
		canSort: boolean;
	}

	let { sortState, isDateColumn, canSort }: Props = $props();
</script>

{#if isDateColumn}
	{#if sortState === 'asc'}
		<ArrowUpIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
	{:else if sortState === 'desc'}
		<ArrowDownIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
	{:else if canSort}
		<ArrowDownIcon class="ml-1 inline h-4 w-4 opacity-0 group-hover:opacity-30" />
	{/if}
{:else if sortState === 'asc'}
	<ArrowDownAZIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
{:else if sortState === 'desc'}
	<ArrowUpZAIcon class="text-secondary-500 ml-1 inline h-4 w-4" />
{:else if canSort}
	<ArrowDownAZIcon class="ml-1 inline h-4 w-4 opacity-0 group-hover:opacity-30" />
{/if}
