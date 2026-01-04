import { goto } from '$app/navigation';
import { DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';
import { SvelteURLSearchParams } from 'svelte/reactivity';

export type NavOptions = { keepFocus?: boolean };

// https://svelte.dev/docs/kit/$app-navigation#goto
export type GoToOptions = {
	replaceState?: boolean | undefined;
	noScroll?: boolean | undefined;
	keepFocus?: boolean | undefined;
	invalidateAll?: boolean | undefined;
	invalidate?: (string | URL | ((url: URL) => boolean))[] | undefined;
	state?: App.PageState | undefined;
};

export type SearchParamValues = {
	page?: number;
	search?: string;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: string;
};

/**
 * Build a URL with the provided search params (i.e., query params), falling back to the values in `current`.
 * `path` should start with a leading `/` (e.g. `/contacts`).
 */
export function buildUrl(next: SearchParamValues, current: SearchParamValues, path = '/') {
	const searchParams = new SvelteURLSearchParams();

	const searchValue = next.search !== undefined ? next.search : current.search;
	if (searchValue) searchParams.set('search', searchValue);

	let pageValue = next.page !== undefined ? next.page : (current.page ?? 1);
	// Coerce to number in case callers pass reactive wrappers or string values
	if (pageValue !== undefined && typeof pageValue !== 'number') {
		pageValue = Number(pageValue);
	}
	searchParams.set('page', String(pageValue));

	let pageSizeValue = next.pageSize !== undefined ? next.pageSize : current.pageSize;
	// Coerce to number when possible to avoid losing the value when passed wrapped/reactive
	if (pageSizeValue !== undefined && typeof pageSizeValue !== 'number') {
		pageSizeValue = Number(pageSizeValue);
	}
	if (
		pageSizeValue !== DEFAULT_PAGE_SIZE &&
		pageSizeValue !== undefined &&
		!Number.isNaN(pageSizeValue)
	) {
		searchParams.set('pageSize', String(pageSizeValue));
	}

	const sortByValue = next.sortBy !== undefined ? next.sortBy : (current.sortBy ?? 'updated_at');
	if (sortByValue !== 'updated_at') {
		searchParams.set('sortBy', sortByValue);
	}

	const sortOrderValue =
		next.sortOrder !== undefined ? next.sortOrder : (current.sortOrder ?? 'desc');
	if (sortOrderValue !== 'desc') {
		searchParams.set('sortOrder', sortOrderValue);
	}

	return `${path}?${searchParams.toString()}`;
}

/**
 * Navigate to a path using the shared `buildUrl` helper.
 * `current` should contain the current search/page/pageSize/sort values from the caller scope.
 */
export async function navigateTo(
	next: SearchParamValues,
	current: SearchParamValues,
	path: string,
	options: GoToOptions = {}
) {
	// Preserve current pageSize unless caller overrides it
	const finalParams: SearchParamValues = { pageSize: current.pageSize, ...next };
	const url = buildUrl(finalParams, current, path);
	await goto(url, options); // eslint-disable-line svelte/no-navigation-without-resolve
}
