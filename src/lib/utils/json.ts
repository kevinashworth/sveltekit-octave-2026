export type NormalizedAddress = {
	street1?: string | null;
	street2?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	location?: string | null;
	address_type?: string | null;
};

/**
 * Try to parse a value that may be JSON (possibly double-encoded) or already an object.
 * Returns the parsed object or the original string if parsing fails, or null for null/undefined.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseMaybeJSON<T = any>(val: unknown): T | string | null {
	if (val == null) return null;
	if (typeof val === 'object') return val as T;
	if (typeof val !== 'string') return null;

	// Trim whitespace
	let s = val.trim();
	if (!s) return null;

	// Try parsing up to 2 times to handle double-encoded JSON
	for (let i = 0; i < 2; i++) {
		try {
			const parsed = JSON.parse(s);
			if (typeof parsed === 'string') {
				// If it parsed to a string, maybe it was double-encoded; try again
				s = parsed;
				continue;
			}
			return parsed as T;
		} catch (e) {
			// If parsing fails on first iteration, break and return the raw string
			console.debug('[parseMaybeJSON] failed:', e);
			break;
		}
	}

	// Not valid JSON — return the raw string so caller can store as street1 or display
	return s;
}

/**
 * Normalize an address-like value (object or string) into our address shape.
 * This makes best-effort mapping from camelCase or snake_case keys.
 */
export function normalizeAddress(val: unknown): NormalizedAddress | null {
	if (val == null) return null;

	if (typeof val === 'string') {
		const raw = val.trim();
		if (!raw) return null;
		return { street1: raw };
	}

	if (typeof val !== 'object') return null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const obj = val as Record<string, any>;

	const s = (k: string) => {
		const v = obj[k] ?? obj[camelToSnake(k)] ?? obj[snakeToCamel(k)];
		return v == null ? '' : String(v).trim();
	};

	function camelToSnake(str: string) {
		return str.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
	}
	function snakeToCamel(str: string) {
		return str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
	}

	const street1 = s('street1') || s('street_1') || s('street');
	const street2 = s('street2') || s('street_2') || s('apt');
	const city = s('city');
	const state = s('state');
	const zip = s('zip') || s('postal_code');
	const location = s('location') || s('location_text') || s('formatted');
	const address_type = s('address_type') || s('type') || s('addressType');

	// If nothing meaningful, return null
	if (!street1 && !city && !state && !location) return null;

	return {
		street1: street1 || null,
		street2: street2 || null,
		city: city || null,
		state: state || null,
		zip: zip || null,
		location: location || null,
		address_type: address_type || null
	};
}
