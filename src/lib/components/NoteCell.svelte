<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { NotepadTextDashedIcon, NotepadTextIcon } from '@lucide/svelte';

	interface Props {
		value: string | null | undefined; // HTML content
		project_title: string;
	}

	let { value, project_title }: Props = $props();
</script>

<Popover.Root>
	{#if value}
		<Popover.Trigger>
			<NotepadTextIcon class="text-blue-500" />
		</Popover.Trigger>
	{:else}
		<div title="No notes available">
			<NotepadTextDashedIcon class="text-gray-500" />
		</div>
	{/if}
	<Popover.Content>
		<article>
			<header>
				<h6>{project_title}</h6>
			</header>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html value}
		</article>
	</Popover.Content>
</Popover.Root>

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
