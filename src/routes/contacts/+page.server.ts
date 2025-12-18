import { supabase } from '$lib/supabase';
import { type Contact } from '$lib/schemas';
import { AddressSchema } from '$lib/schemas/common';
import { z } from 'zod';

const PAGE_SIZE = 20;

// Define a schema for the data we get from Supabase (snake_case from DB)
const DbContactSchema = z.object({
	id: z.string(),
	first_name: z.string().optional().nullable(),
	last_name: z.string().optional().nullable(),
	updated_at: z.string().optional().nullable(),
	the_address: z
		.union([
			z.object({
				street1: z.string().optional().nullable(),
				street2: z.string().optional().nullable(),
				city: z.string().optional().nullable(),
				state: z.string().optional().nullable(),
				zip: z.string().optional().nullable(),
				location: z.string().optional().nullable()
			}),
			z.string() // Can also be an empty string
		])
		.optional()
		.nullable(),
	address_string: z.string().optional().nullable()
});

// Transform DB data to match Contact schema (camelCase)
function transformContact(dbContact: z.infer<typeof DbContactSchema>): Partial<Contact> {
	let parsedAddress: z.infer<typeof AddressSchema> | undefined = undefined;

	// Parse the_address if it's a JSON string
	if (dbContact.the_address) {
		try {
			const addressData =
				typeof dbContact.the_address === 'string'
					? JSON.parse(dbContact.the_address)
					: dbContact.the_address;

			// Validate against AddressSchema
			parsedAddress = AddressSchema.parse(addressData);
		} catch (error) {
			console.warn('Failed to parse theAddress:', error);
		}
	}

	return {
		_id: dbContact.id,
		firstName: dbContact.first_name ?? undefined,
		lastName: dbContact.last_name ?? undefined,
		updatedAt: dbContact.updated_at ? new Date(dbContact.updated_at) : undefined,
		theAddress: parsedAddress,
		addressString: dbContact.address_string ?? undefined
	};
}

export async function load({ url }) {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const offset = (page - 1) * PAGE_SIZE;

	try {
		// Get total count
		const { count: totalCount, error: countError } = await supabase
			.from('contacts')
			.select('id', { count: 'exact' });

		if (countError) throw countError;

		// Get paginated data
		const { data: rawContacts, error: dataError } = await supabase
			.from('contacts')
			.select('id, first_name, last_name, updated_at, the_address, address_string')
			.order('updated_at', { ascending: false })
			.range(offset, offset + PAGE_SIZE - 1);

		if (dataError) throw dataError;

		// Validate and transform the data
		const validatedContacts = (rawContacts || []).map((contact) => {
			// Validate against DB schema first
			const dbValid = DbContactSchema.parse(contact);
			// Transform to camelCase
			return transformContact(dbValid);
		});

		const paginationSettings = {
			page: page,
			amount: Math.ceil((totalCount || 0) / PAGE_SIZE),
			limit: 1
		};

		return {
			contacts: validatedContacts as Partial<Contact>[],
			totalCount: totalCount || 0,
			pageSize: PAGE_SIZE,
			currentPage: page,
			paginationSettings
		};
	} catch (error) {
		console.error('Error loading contacts:', error);

		const paginationSettings = {
			page: page,
			amount: 0,
			limit: 1
		};

		return {
			contacts: [],
			totalCount: 0,
			pageSize: PAGE_SIZE,
			currentPage: page,
			paginationSettings,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
