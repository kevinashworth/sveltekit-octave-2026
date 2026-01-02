<script lang="ts">
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
		<button
			appearance="plain"
			id={popoverId}
			size="small"
			title="Click to see Notes"
			variant="brand"
		>
			<NotepadTextIcon />
		</button>
	{:else}
		<button appearance="plain" disabled size="small" title="No notes available" variant="neutral">
			<NotepadTextDashedIcon />
		</button>
	{/if}

	<popover distance={10} for={popoverId} placement="bottom">
		<article>
			<header>
				<h6>{project_title}</h6>
			</header>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html value}
		</article>
	</popover>
</div>

<style>
	article :global {
		a {
			color: #0071ec;
			text-decoration: underline;
		}
		h6 {
			color: #0071ec;
			font-weight: 600;
		}
		p strong {
			color: #0071ec;
			font-size: smaller;
		}
	}
</style>
