/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeAddress, NormalizedAddress, parseMaybeJSON } from '../src/lib/utils/json.ts';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY; // Use service role key for writes

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
	console.log('🚚 Starting migration of the_address → addresses...');

	const report: any[] = [];
	const failures: any[] = [];

	// Page through rows to avoid huge memory usage
	let page = 0;
	const pageSize = 100;

	while (true) {
		const { data: contacts, error } = await supabase
			.from('contacts')
			.select('id,the_address,address_string')
			.is('the_address_migrated_at', null)
			.not('the_address', 'is', null)
			.range(page * pageSize, page * pageSize + pageSize - 1);

		if (error) {
			console.error('Error fetching contacts:', error);
			process.exit(1);
		}

		if (!contacts || contacts.length === 0) break;

		for (const contact of contacts) {
			const contactId = contact.id as string;
			const raw = contact.the_address as string;

			try {
				// Parse then normalize
				const parsed = parseMaybeJSON(raw);
				const normalized = normalizeAddress(parsed ?? contact.address_string ?? raw);

				if (!normalized) {
					failures.push({ contactId, reason: 'Could not parse or normalize address', raw });
					// Mark migrated anyway so we don't try repeatedly; manual inspection required later
					await supabase
						.from('contacts')
						.update({ the_address_migrated_at: new Date().toISOString() })
						.eq('id', contactId);
					continue;
				}

				// Ensure required fields city/state exist (addresses table requires non-null strings)
				const addressToInsert: NormalizedAddress = {
					street1: normalized.street1 || null,
					street2: normalized.street2 || null,
					city: normalized.city ?? '',
					state: normalized.state ?? '',
					zip: normalized.zip || null,
					location: normalized.location || null,
					address_type: normalized.address_type || null
				};

				// Try to find existing address (match on main fields)
				const matchQuery: any = {
					street1: addressToInsert.street1,
					street2: addressToInsert.street2,
					city: addressToInsert.city,
					state: addressToInsert.state,
					zip: addressToInsert.zip
				};

				const { data: existing, error: fetchErr } = await supabase
					.from('addresses')
					.select('id')
					.match(matchQuery)
					.limit(1);

				if (fetchErr) throw fetchErr;

				let addressId: number | null = existing?.[0]?.id ?? null;

				if (!addressId) {
					const { data: inserted, error: insertErr } = await supabase
						.from('addresses')
						.insert({
							street1: addressToInsert.street1,
							street2: addressToInsert.street2,
							city: addressToInsert.city,
							state: addressToInsert.state,
							zip: addressToInsert.zip,
							address_type: addressToInsert.address_type,
							location: addressToInsert.location
						})
						.select('id');

					if (insertErr) throw insertErr;
					addressId = inserted?.[0]?.id ?? null;
				}

				if (!addressId) {
					failures.push({ contactId, reason: 'Failed to get or create address id', normalized });
					await supabase
						.from('contacts')
						.update({ the_address_migrated_at: new Date().toISOString() })
						.eq('id', contactId);
					continue;
				}

				// Ensure mapping exists
				const { data: mapping, error: mapErr } = await supabase
					.from('contact_addresses')
					.select('id')
					.match({ contact_id: contactId, address_id: addressId })
					.limit(1);

				if (mapErr) throw mapErr;

				if (!mapping || mapping.length === 0) {
					const { error: insertMapErr } = await supabase
						.from('contact_addresses')
						.insert({ contact_id: contactId, address_id: addressId });
					if (insertMapErr) throw insertMapErr;
				}

				// Mark contact as migrated
				await supabase
					.from('contacts')
					.update({ the_address_migrated_at: new Date().toISOString() })
					.eq('id', contactId);

				report.push({ contactId, addressId, normalized: addressToInsert });
			} catch (err: any) {
				console.error(`Failed for contact ${contact.id}:`, err.message || err);
				failures.push({ contactId: contact.id, reason: err.message || String(err) });
				// Don't throw — mark contact for manual review and continue
				await supabase
					.from('contacts')
					.update({ the_address_migrated_at: new Date().toISOString() })
					.eq('id', contact.id);
			}
		}

		page++;
	}

	// Write reports
	const outDir = path.join(__dirname, 'migration-output');
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
	fs.writeFileSync(
		path.join(outDir, `addresses-migration-report.json`),
		JSON.stringify({ report, failures }, null, 2)
	);

	console.log(`
✅ Done. Migrated ${report.length} contacts. Failures: ${failures.length}.`);
	console.log(`Report written to ${outDir}/addresses-migration-report.json`);
}

run().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
