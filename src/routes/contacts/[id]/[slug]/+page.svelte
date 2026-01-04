<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageData } from './$types';

	import ContactLink from '$lib/components/ContactLink.svelte';
	import { pluralize } from '$lib/utils/inflect';

	let { data }: { data: PageData } = $props();
	const contact = $derived(data.contact);
	// $inspect(contact);

	function createdIso(d: string | null | undefined) {
		if (!d) return 'N/A';
		return new Date(d).toISOString().split('T')[0];
	}

	function formatUpdated(d: string | null | undefined) {
		if (!d) return 'N/A';
		const formatted = new Date(d).toLocaleString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
		// Remove comma between day and year to match requested style: "December 31 2025, 8:44 PM"
		return formatted.replace(/, (\d{4}),/, ' $1,');
	}

	/**
	 * Format an address that may be a string or an object with various keys.
	 * Accepts snake_case or camelCase keys and returns an HTML string.
	 * If `address_type` exists it is prefixed in bold and line breaks are represented with `<br/>`.
	 */
	function escapeHtml(s: string) {
		return String(s).replace(/[&<>"']/g, (ch) => {
			switch (ch) {
				case '&':
					return '&amp;';
				case '<':
					return '&lt;';
				case '>':
					return '&gt;';
				case '"':
					return '&quot;';
				case "'":
					return '&#39;';
				default:
					return ch;
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function formatAddress(addr: any): string {
		if (!addr) return escapeHtml('—');
		if (typeof addr === 'string') return escapeHtml(addr);

		const street1 = (addr.street1 ?? addr.street_1 ?? '').trim();
		const street2 = (addr.street2 ?? addr.street_2 ?? '').trim();
		const city = (addr.city ?? '').trim();
		const state = (addr.state ?? '').trim();
		const zip = (addr.zip ?? '').trim();
		const location = (addr.location ?? addr.location_text ?? '').trim();

		const streetParts: string[] = [];
		if (street1) streetParts.push(street1);
		if (street2) streetParts.push(street2);
		const streetLine = streetParts.join(', ');

		const cityStateParts: string[] = [];
		if (city) cityStateParts.push(city);
		if (state) cityStateParts.push(state);
		const cityState = cityStateParts.join(', ');
		const cityStateLine = cityState ? `${cityState}${zip ? ' ' + zip : ''}` : zip ? zip : '';

		// Build lines (each will become a <br/> separated line in HTML)
		let lines: string[] = [];
		if (streetLine && cityStateLine) {
			lines = [streetLine, cityStateLine];
		} else if (streetLine) {
			if (location) lines = [streetLine, location];
			else lines = [streetLine];
		} else if (cityStateLine) {
			lines = [cityStateLine];
		} else if (location) {
			lines = [location];
		} else {
			return escapeHtml('—');
		}

		const escapedLines = lines.map(escapeHtml);
		const bodyHtml = escapedLines.join('<br/>');

		return bodyHtml;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title><h1 class="text-2xl font-bold">{contact.display_name}</h1></Card.Title>
		<Card.Action>
			<Button>Edit</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<div class="space-y-2">
			<div>
				<strong>{contact.first_name ?? '—'} {contact.last_name ?? '—'}</strong>
				<div>{contact.title ?? '—'}</div>
				<hr class="my-1 text-gray-100" />
			</div>

			{#if contact.html_body}
				<div>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div>{@html contact.html_body}</div>
				</div>
			{/if}

			{#if contact.addresses && contact.addresses.length}
				<div>
					<h3 class="font-semibold">
						{pluralize(contact.addresses?.length ?? 0, 'Address', 'Addresses')}
					</h3>
					<div class="mt-2">
						{#each contact.addresses as addr (addr.id)}
							<div class="text-sm font-semibold text-gray-600">
								{addr.address_type ?? addr.addressType}
							</div>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<div class="text-sm text-gray-600">{@html formatAddress(addr)}</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if contact.links && contact.links.length}
				<div>
					<h3 class="font-semibold">Links</h3>
					<div class="flex flex-wrap gap-1">
						{#each contact.links as link (link.id)}
							<ContactLink {link} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</Card.Content>
	<Card.Footer>
		<div class="text-xs text-gray-500">
			Contact added to database {createdIso(contact.created_at)} / Last modified {formatUpdated(
				contact.updated_at
			)}
		</div>
	</Card.Footer>
</Card.Root>
