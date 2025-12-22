import { getContext, setContext } from 'svelte';

import { DEFAULT_PAGE_SIZE } from '$lib/constants/pagination';

/**
 * Shared PaginationState across all paginated tables.
 * This ensures that when a user changes the page size on one table, that
 * pageSize preference carries over to other tables.
 * Should setPaginationState at the layout level, then accessed via
 * getPaginationState in components.
 */

export class PaginationState {
	pageSize = $state<number>(DEFAULT_PAGE_SIZE);

	setPageSize(newPageSize: number) {
		this.pageSize = newPageSize;
		// console.log('paginationState setPageSize', { pageSize: this.pageSize });
	}
}

const PAGINATION_CONTEXT_KEY = Symbol('pagination');

export function setPaginationState() {
	return setContext(PAGINATION_CONTEXT_KEY, new PaginationState());
}

export function getPaginationState() {
	return getContext<PaginationState>(PAGINATION_CONTEXT_KEY);
}
