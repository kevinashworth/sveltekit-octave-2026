import { redirect } from '@sveltejs/kit';

import { ALLOWED_PAGE_SIZES, DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
import type { Database } from '$lib/database.types';
import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

interface PastProject {
	id: string;
	project_title: string;
	casting_company: string | null;
	network: string | null;
	project_type: Database['public']['Enums']['project_type'] | null;
	status: Database['public']['Enums']['project_status'] | null;
	updated_at: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	// Get pagination parameters
	const requestedPage = parseInt(url.searchParams.get('page') ?? '1') || 1;
	let page = Math.max(1, requestedPage);
	const search = url.searchParams.get('search')?.toLowerCase() ?? '';
	const requestedPageSize = parseInt(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE));
	const pageSize = ALLOWED_PAGE_SIZES.includes(requestedPageSize)
		? requestedPageSize
		: DEFAULT_PAGE_SIZE;

	// Get sort parameters
	const sortBy = url.searchParams.get('sortBy') ?? 'updated_at';
	const sortOrder = url.searchParams.get('sortOrder') ?? 'desc';
	const ascending = sortOrder === 'asc';

	try {
		// Split search into individual terms and filter out empty strings
		const searchTerms = search.trim().split(/\s+/).filter(Boolean);
		const hasSearch = searchTerms.length > 0;

		// Build the base query - select all past_projects
		let query = supabase.from('past_projects').select(
			`
				id,
				project_title,
				casting_company,
				network,
				project_type,
				html_notes,
				status,
				updated_at
			`,
			{ count: 'exact' }
		);

		// If search terms exist, filter by them on project_title, network, and casting_company
		if (hasSearch) {
			const orConditions = searchTerms
				.map((term) => {
					return `project_title.ilike.%${term}%,network.ilike.%${term}%,casting_company.ilike.%${term}%`;
				})
				.join(',');

			query = query.or(orConditions);
		}

		// Apply sorting
		query = query.order(sortBy, { ascending });

		// Execute query to get count and validate page
		const countResponse = await query;
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
		const { data: rawProjects, error: dataError } = await query.range(
			offset,
			offset + pageSize - 1
		);

		if (dataError) throw dataError;

		const projects: PastProject[] = rawProjects || [];

		const paginationSettings = {
			page: page,
			amount: maxPages,
			limit: 1
		};

		return {
			projects,
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

		console.error('Error loading past projects:', error);

		return {
			projects: [],
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
			sortOrder: 'desc'
		};
	}
};
