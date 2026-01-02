import { supabase } from '$lib/supabase';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const contactId = params.id;
	if (!contactId) throw error(400, 'Missing contact id');

	try {
		const { data: contactData, error: dbError } = await supabase
			.from('contacts')
			.select(
				`
				id,
				display_name,
				first_name,
				last_name,
				title,
				gender,
				html_body,
				created_at,
				updated_at,
				contact_addresses(addresses(id,street1,street2,city,state,zip,address_type,location)),
				contact_links(links(id,platform_name,profile_name,profile_link))
			`
			)
			.eq('id', contactId)
			.maybeSingle();

		if (dbError) throw dbError;
		if (!contactData) throw error(404, 'Contact not found');

		// Extract nested addresses and links into simpler arrays
		const addresses = (contactData.contact_addresses || [])
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.map((ca: any) => ca.addresses)
			.filter(Boolean);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const links = (contactData.contact_links || []).map((cl: any) => cl.links).filter(Boolean);

		return {
			contact: {
				...contactData,
				addresses,
				links
			}
		};
	} catch (err) {
		console.error('Error loading contact:', err);
		throw error(500, 'Error loading contact');
	}
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const contactId = params.id;
		if (!contactId) throw error(400, 'Missing contact id');

		try {
			// Remove child rows first
			await supabase.from('contact_addresses').delete().eq('contact_id', contactId);
			await supabase.from('contact_links').delete().eq('contact_id', contactId);

			const { error: delError } = await supabase.from('contacts').delete().eq('id', contactId);
			if (delError) throw delError;

			throw redirect(303, '/contacts');
		} catch (err) {
			console.error('Error deleting contact:', err);
			return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
		}
	}
};
