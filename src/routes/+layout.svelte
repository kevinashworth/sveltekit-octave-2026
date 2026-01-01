<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import { setPaginationState } from '$lib/stores/pagination-state.svelte';
	import '../app.css';

	const hasHeader = false; // Set to true if you want to show the header
	const hasFooter = false; // Set to true if you want to show the footer

	let { children } = $props();

	setPaginationState();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	{#if hasHeader}
		<Header />
	{/if}

	<div class="grid h-full grid-cols-1 md:grid-cols-[auto_1fr]">
		<Sidebar {hasHeader} {hasFooter} />
		<main class="space-y-4 p-4">
			{@render children()}
		</main>
	</div>

	{#if hasFooter}
		<footer class="bg-blue-500 p-4">(footer)</footer>
	{/if}
</div>
