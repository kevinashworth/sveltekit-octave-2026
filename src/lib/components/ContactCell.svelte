<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		id: string;
		slug: string;
		first: string | null;
		last: string | null;
	}

	let { id, slug, first, last }: Props = $props();
</script>

<a class="text-blue-600 hover:underline" href={resolve(`/contacts/${id}/${slug}`)}>
	{first}{#if last}&nbsp;{last}{/if}
</a>
