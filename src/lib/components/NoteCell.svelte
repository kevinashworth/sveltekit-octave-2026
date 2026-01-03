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
		<Popover.Trigger class="cursor-pointer">
			<NotepadTextIcon class="text-blue-500" />
		</Popover.Trigger>
	{:else}
		<Popover.Trigger>
			<NotepadTextDashedIcon class="text-gray-500" />
		</Popover.Trigger>
	{/if}
	<Popover.Content>
		<article>
			<header>
				<h6>{project_title}</h6>
			</header>
			{#if !value}
				<p>No notes available.</p>
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html value}
			{/if}
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
