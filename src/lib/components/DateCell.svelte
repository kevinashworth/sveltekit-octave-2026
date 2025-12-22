<script lang="ts">
	interface Props {
		value: string | null | undefined;
	}

	let { value }: Props = $props();

	const formattedDate = $derived(() => {
		if (!value) return 'N/A';
		return new Date(value).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	});
</script>

{formattedDate()}
