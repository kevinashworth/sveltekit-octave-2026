<script lang="ts">
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/popover/popover.js';
	import '@awesome.me/webawesome/dist/styles/themes/default.css';
	import { NotepadTextDashedIcon, NotepadTextIcon } from '@lucide/svelte';

	interface Props {
		value: string | null | undefined; // HTML content
		id: string | null;
		project_title: string;
	}

	let { value, id = null, project_title }: Props = $props();
	const popoverId = $derived(`popover-${id ? id : crypto.randomUUID()}`);
</script>

<div>
	{#if value}
		<wa-button
			appearance="plain"
			id={popoverId}
			size="small"
			title="Click to see Notes"
			variant="brand"
		>
			<NotepadTextIcon />
		</wa-button>
	{:else}
		<wa-button appearance="plain" size="small" title="No notes available" variant="neutral">
			<NotepadTextDashedIcon />
		</wa-button>
	{/if}

	<wa-popover
		class="wa-body m-4 max-w-xs card border bg-primary-50 p-4 shadow"
		for={popoverId}
		placement="bottom"
	>
		<h6>{project_title}</h6>
		<article>{@html value}</article>
	</wa-popover>
</div>

<style>
	::backdrop {
		backdrop-filter: blur(0.5px);
	}

	:popover-open {
		inset: unset;
		position: relative;
		top: 0.5rem;
	}

	article :global {
		a {
			color: #0071ec;
			text-decoration: underline;
		}
	}
</style>
