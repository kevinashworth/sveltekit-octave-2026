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
 * Format an address object into a string: "street1, street2, city, state, zip"
 * Returns empty string if address is null/undefined
 */
function formatAddress(address: DbAddress | null | undefined): string {
	if (!address) return '';

	const parts: string[] = [];
	if (address.street1) parts.push(address.street1);
	if (address.street2) parts.push(address.street2);
	if (address.city) parts.push(address.city);
	if (address.state) parts.push(address.state);
	if (address.zip) parts.push(address.zip);

	return parts.join(', ');
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

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);

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

		// If search terms exist, filter by them (each term must match at least one field)
		if (searchTerms.length > 0) {
			// Apply each term as a separate OR filter across all searchable fields
			for (const term of searchTerms) {
				query = query.or(
					`display_name.ilike.%${term}%,office_addresses.addresses.street1.ilike.%${term}%,office_addresses.addresses.city.ilike.%${term}%,office_addresses.addresses.state.ilike.%${term}%`
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

		// Redirect if page or pageSize were invalid
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
		const { data: rawOffices, error: dataError } = await query
			.order('updated_at', { ascending: false })
			.range(offset, offset + pageSize - 1);

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

		console.error('Error loading offices:', error);

		return {
			offices: [],
			totalCount: 0,
			pageSize: pageSize,
			currentPage: page,
			paginationSettings: {
				page: page,
				amount: 0,
				limit: 1
			},
			search: search
		};
	}
};
