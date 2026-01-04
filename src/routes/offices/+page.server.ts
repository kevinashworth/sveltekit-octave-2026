import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
import type { Database } from '$lib/database.types';
import { supabase } from '$lib/supabase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type DbAddress = Database['public']['Tables']['addresses']['Row'];

interface OfficeWithAddress {
	id: string;
	display_name: string;
	updated_at: string | null;
	formattedAddress: string;
}

/**
 * Format an address object into a string: "street1 street2, city state zip"
 * Returns empty string if address is null/undefined
 */
function formatAddress(address: DbAddress | null | undefined): string {
	if (!address) return '';

	const streetParts: string[] = [];
	if (address.street1) streetParts.push(address.street1);
	if (address.street2) streetParts.push(address.street2);

	const cityStateParts: string[] = [];
	if (address.city) cityStateParts.push(address.city);
	if (address.state) cityStateParts.push(address.state);
	if (address.zip) cityStateParts.push(address.zip);

	const sections: string[] = [];
	if (streetParts.length > 0) sections.push(streetParts.join(' '));
	if (cityStateParts.length > 0) sections.push(cityStateParts.join(' '));

	return sections.join(', ');
}

/**
 * Select the best address from an array of addresses
 * Prefer "Office" type, otherwise take the first address
 */
function selectBestAddress(addresses: DbAddress[] | null | undefined): DbAddress | null {
	if (!addresses || addresses.length === 0) return null;

	// Prefer "Office" type address
	const officeAddress = addresses.find((addr) => addr.address_type === 'Office');
	if (officeAddress) return officeAddress;

	// Fallback to first address
	return addresses[0];
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
	const ALLOWED_SORT_COLUMNS = ['display_name', 'updated_at'];
	if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
		sortBy = 'updated_at';
	}

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);
		const hasSearch = searchTerms.length > 0;

		// Build the base query with nested join to addresses
		let query = supabase.from('offices').select(
			`
				id,
				display_name,
				updated_at,
				office_addresses(
					addresses(
						id,
						street1,
						street2,
						city,
						state,
						zip,
						address_type
					)
				)
			`,
			{ count: 'exact' }
		);

		// If search terms exist, filter by them on the display_name field
		if (hasSearch) {
			const orConditions = searchTerms
				.map((term) => {
					return `display_name.ilike.%${term}%`;
				})
				.join(',');
			query = query.or(orConditions);
		}

		// Build complete query before executing
		const finalQuery = query.order(sortBy, { ascending });

		// Execute query to get count and validate page
		const countResponse = await finalQuery;
		const totalCount = countResponse.count || 0;
		if (countResponse.error) throw countResponse.error;

		const maxPages = Math.ceil(totalCount / pageSize);
		const clampedPage = Math.max(1, Math.min(page, maxPages || 1));

		// Redirect if page or pageSize were invalid
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
		const { data: rawOffices, error: dataError } = await finalQuery.range(
			offset,
			offset + pageSize - 1
		);

		if (dataError) throw dataError;

		// Process offices to format addresses
		const offices: OfficeWithAddress[] =
			rawOffices?.map((office) => {
				// Extract addresses from nested structure
				const addresses = office.office_addresses?.map((oa) => oa.addresses).filter(Boolean) || [];

				// Select best address and format it
				const bestAddress = selectBestAddress(addresses as DbAddress[]);
				const formattedAddress = formatAddress(bestAddress);

				return {
					id: office.id,
					display_name: office.display_name,
					updated_at: office.updated_at,
					formattedAddress
				};
			}) || [];

		const paginationSettings = {
			page: page,
			amount: maxPages,
			limit: 1
		};

		return {
			offices,
			totalCount,
			pageSize,
			currentPage: page,
			paginationSettings,
			search,
			sortBy,
			sortOrder
		};
	} catch (error) {
		// Re-throw redirects - they have a status property
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			throw error;
		}

		console.error('Error loading offices:', error);

		return {
			offices: [],
			totalCount: 0,
			pageSize,
			currentPage: page,
			paginationSettings: {
				page: page,
				amount: 0,
				limit: 1
			},
			search,
			sortBy: 'updated_at',
			sortOrder: 'desc',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
