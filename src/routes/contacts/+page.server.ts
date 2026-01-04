import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// type DbContact = Database['public']['Tables']['contacts']['Row'];

interface Contact {
	id: string;
	first_name: string | null;
	last_name: string | null;
	slug: string;
	updated_at: string | null;
	address_string: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	const requestedPage = parseInt(url.searchParams.get('page') ?? '1') || 1;
	let page = Math.max(1, requestedPage);
	const search = url.searchParams.get('search')?.toLowerCase() ?? '';
	const requestedPageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE));
	const pageSize = ALLOWED_PAGE_SIZES.includes(requestedPageSize)
		? requestedPageSize
		: DEFAULT_PAGE_SIZE;

	let sortBy = url.searchParams.get('sortBy') ?? 'updated_at';
	const sortOrder = url.searchParams.get('sortOrder') ?? 'desc';
	const ascending = sortOrder === 'asc';

	// Validate sortBy against allowed columns
	const ALLOWED_SORT_COLUMNS = ['first_name', 'address_string', 'updated_at'];
	if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
		sortBy = 'updated_at';
	}

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);
		const hasSearch = searchTerms.length > 0;

		// Build the base query
		let query = supabase
			.from('contacts')
			.select('id, first_name, last_name, slug, updated_at, address_string', {
				count: 'exact'
			});

		// If search terms exist, filter by them on first_name, last_name, and address_string
		if (hasSearch) {
			const orConditions = searchTerms
				.flatMap((term) =>
					['first_name', 'last_name', 'address_string'].map((field) => `${field}.ilike.%${term}%`)
				)
				.join(',');
			query = query.or(orConditions);
		}

		// Build complete query before executing
		const orderedQuery = query.order(sortBy, { ascending });

		// Execute query to get count and validate page
		const countResponse = await orderedQuery;
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
			if (sortBy !== 'updated_at') params.set('sortBy', sortBy);
			if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
			throw redirect(307, `?${params.toString()}`);
		}

		page = clampedPage;
		const offset = (page - 1) * pageSize;

		// Execute again with range for paginated data
		const { data: rawContacts, error: dataError } = await orderedQuery.range(
			offset,
			offset + pageSize - 1
		);

		if (dataError) throw dataError;

		const contacts: Contact[] = rawContacts || [];

		const paginationSettings = {
			page: page,
			amount: maxPages,
			limit: 1
		};

		return {
			contacts,
			totalCount: totalCount,
			pageSize: pageSize,
			currentPage: page,
			paginationSettings,
			search: search,
			sortBy,
			sortOrder
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
			sortBy: 'updated_at',
			sortOrder: 'desc',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
