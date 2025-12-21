import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
import type { Database } from '$lib/database.types';
import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';

type DbContact = Database['public']['Tables']['contacts']['Row'];

export async function load({ url }) {
	const requestedPage = parseInt(url.searchParams.get('page') ?? '1') || 1;
	let page = Math.max(1, requestedPage);
	const search = url.searchParams.get('search')?.toLowerCase() ?? '';
	const requestedPageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE));
	const pageSize = ALLOWED_PAGE_SIZES.includes(requestedPageSize)
		? requestedPageSize
		: DEFAULT_PAGE_SIZE;

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);

		// Build the base query
		let query = supabase
			.from('contacts')
			.select('id, first_name, last_name, updated_at, the_address, address_string', {
				count: 'exact'
			});

		// If search terms exist, filter by them (each term must match at least one field)
		if (searchTerms.length > 0) {
			// Apply each term as a separate OR filter across all searchable fields
			for (const term of searchTerms) {
				query = query.or(
					`first_name.ilike.%${term}%,last_name.ilike.%${term}%,address_string.ilike.%${term}%`
				);
			}
		}

		// Build complete query before executing
		const finalQuery = query.order('updated_at', { ascending: false });

		// Execute query to get count and validate page
		const countResponse = await finalQuery;
		const totalCount = countResponse.count || 0;
		if (countResponse.error) throw countResponse.error;

		const maxPages = Math.ceil(totalCount / pageSize);
		const clampedPage = Math.max(1, Math.min(page, maxPages || 1));

		// Redirect if page or pageSize were invalid (do this after try-catch to avoid error catching)
		if (clampedPage !== requestedPage || pageSize !== requestedPageSize) {
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			params.set('page', String(clampedPage));
			if (pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(pageSize));
			throw redirect(307, `?${params.toString()}`);
		}

		page = clampedPage;
		const offset = (page - 1) * pageSize;

		// Execute again with range for paginated data
		const { data: contacts, error: dataError } = await query
			.order('updated_at', { ascending: false })
			.range(offset, offset + pageSize - 1);

		if (dataError) throw dataError;

		const paginationSettings = {
			page: page,
			amount: maxPages,
			limit: 1
		};

		return {
			contacts: (contacts as DbContact[]) || [],
			totalCount: totalCount,
			pageSize: pageSize,
			currentPage: page,
			paginationSettings,
			search: search
		};
	} catch (error) {
		// Re-throw redirects - they have a status property
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			throw error;
		}

		console.error('Error loading contacts:', error);

		return {
			contacts: [],
			totalCount: 0,
			pageSize: pageSize,
			currentPage: page,
			paginationSettings: {
				page: page,
				amount: 0,
				limit: 1
			},
			search: search,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
