/**
 * Format a date string or null value into a localized date string
 * @param value - ISO date string or null
 * @returns Formatted date string or 'N/A'
 */
export function formatDate(value: string | null | undefined): string {
	if (!value) return 'N/A';
	return new Date(value).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}
