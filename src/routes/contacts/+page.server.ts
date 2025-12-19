import { supabase } from '$lib/supabase';
// import type { Database } from '$lib/database.types';

// type DbContact = Database['public']['Tables']['contacts']['Row'];

const PAGE_SIZE = 20;

export async function load({ url }) {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const search = url.searchParams.get('search')?.toLowerCase() ?? '';
	const offset = (page - 1) * PAGE_SIZE;

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);

		// Build the base query
		let query = supabase
			.from('contacts')
			.select('id, first_name, last_name, updated_at, the_address, address_string');

		// If search terms exist, filter by them (each term must match at least one field)
		if (searchTerms.length > 0) {
			// Apply each term as a separate OR filter across all searchable fields
			for (const term of searchTerms) {
				query = query.or(
					`first_name.ilike.%${term}%,last_name.ilike.%${term}%,address_string.ilike.%${term}%`
				);
			}
		}

		// Get total count with search filter applied
		const countQuery = supabase.from('contacts').select('id', { count: 'exact' });
		if (searchTerms.length > 0) {
			for (const term of searchTerms) {
				countQuery.or(
					`first_name.ilike.%${term}%,last_name.ilike.%${term}%,address_string.ilike.%${term}%`
				);
			}
		}
		const { count: totalCount, error: countError } = await countQuery;

		if (countError) throw countError;

		// Get paginated data with search filter
		const { data: contacts, error: dataError } = await query
			.order('updated_at', { ascending: false })
			.range(offset, offset + PAGE_SIZE - 1);

		if (dataError) throw dataError;

		const paginationSettings = {
			page: page,
			amount: Math.ceil((totalCount || 0) / PAGE_SIZE),
			limit: 1
		};

		return {
			contacts: contacts || [],
			totalCount: totalCount || 0,
			pageSize: PAGE_SIZE,
			currentPage: page,
			paginationSettings,
			search: search
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
			search: search,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
