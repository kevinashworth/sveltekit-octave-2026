<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	interface Props {
		value: string;
	}

	let { value }: Props = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<div class="flex h-full items-center">
			{value}
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<p>{value} is a non-sorting column.</p>
	</Tooltip.Content>
</Tooltip.Root>
