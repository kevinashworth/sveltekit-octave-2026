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
		<wa-button
			appearance="plain"
			disabled
			size="small"
			title="No notes available"
			variant="neutral"
		>
			<NotepadTextDashedIcon />
		</wa-button>
	{/if}

	<wa-popover distance={10} for={popoverId} placement="bottom">
		<article>
			<header>
				<h6>{project_title}</h6>
			</header>
			{@html value}
		</article>
	</wa-popover>
</div>

<style>
	/* https://github.com/shoelace-style/webawesome/discussions/1520#discussioncomment-15013951 */
	wa-button[appearance='plain']::part(base) {
		height: auto;
		padding: 0;
	}

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
