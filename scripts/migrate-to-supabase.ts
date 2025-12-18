import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to load JSON files
function loadJSON(filename: string) {
	const filePath = path.join(__dirname, '../import', filename);
	return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Convert MongoDB date format to ISO string
function mongoDateToISO(mongoDate: any): string {
	if (!mongoDate || !mongoDate.$date) return new Date().toISOString();
	return new Date(mongoDate.$date).toISOString();
}

// Types
interface Address {
	street1?: string | null;
	street2?: string | null;
	city: string;
	state: string;
	zip?: string | null;
	addressType?: string | null;
	location?: string | null;
}

interface Link {
	platformName: string;
	profileName: string;
	profileLink: string;
}

// Main migration function
async function migrate() {
	console.log('🚀 Starting migration from MongoDB JSON to Supabase...\n');

	try {
		// Load all data
		console.log('📂 Loading data files...');
		const users = loadJSON('users.json');
		const offices = loadJSON('offices.json');
		const contacts = loadJSON('contacts.json');
		const projects = loadJSON('projects.json');
		const pastProjects = loadJSON('pastprojects.json');
		const comments = loadJSON('comments.json');
		const statistics = loadJSON('statistics.json');
		console.log(
			`✓ Loaded: ${users.length} users, ${offices.length} offices, ${contacts.length} contacts, ${projects.length} projects, ${pastProjects.length} past projects, ${comments.length} comments\n`
		);

		// Collect valid user IDs
		const validUserIds = new Set(users.map((u) => u._id));

		// Filter out records with invalid foreign keys
		const validOffices = offices.filter((o) => {
			if (!validUserIds.has(o.userId)) {
				console.warn(`⚠️  Skipping office ${o._id}: user ${o.userId} not found`);
				return false;
			}
			return true;
		});

		const validContacts = contacts.filter((c) => {
			if (!validUserIds.has(c.userId)) {
				console.warn(`⚠️  Skipping contact ${c._id}: user ${c.userId} not found`);
				return false;
			}
			return true;
		});

		const validProjects = projects.filter((p) => {
			if (!validUserIds.has(p.userId)) {
				console.warn(`⚠️  Skipping project ${p._id}: user ${p.userId} not found`);
				return false;
			}
			return true;
		});

		const validPastProjects = pastProjects.filter((p) => {
			if (!validUserIds.has(p.userId)) {
				console.warn(`⚠️  Skipping past project ${p._id}: user ${p.userId} not found`);
				return false;
			}
			return true;
		});

		const validComments = comments.filter((c) => {
			if (!validUserIds.has(c.userId)) {
				console.warn(`⚠️  Skipping comment ${c._id}: user ${c.userId} not found`);
				return false;
			}
			return true;
		});

		console.log(
			`✓ After validation: ${validOffices.length} offices, ${validContacts.length} contacts, ${validProjects.length} projects, ${validPastProjects.length} past projects, ${validComments.length} comments\n`
		);

		// Clean existing data first (reverse order of dependencies)
		console.log('🧹 Cleaning existing data...');
		await supabase.from('comments').delete().neq('id', '');
		await supabase.from('statistics').delete().neq('id', '');
		await supabase.from('office_past_projects').delete().neq('id', '');
		await supabase.from('office_projects').delete().neq('id', '');
		await supabase.from('contact_past_projects').delete().neq('id', '');
		await supabase.from('contact_projects').delete().neq('id', '');
		await supabase.from('office_contacts').delete().neq('id', '');
		await supabase.from('project_links').delete().neq('id', '');
		await supabase.from('past_project_links').delete().neq('id', '');
		await supabase.from('office_links').delete().neq('id', '');
		await supabase.from('contact_links').delete().neq('id', '');
		await supabase.from('office_addresses').delete().neq('id', '');
		await supabase.from('contact_addresses').delete().neq('id', '');
		await supabase.from('office_phones').delete().neq('id', '');
		await supabase.from('past_projects').delete().neq('id', '');
		await supabase.from('projects').delete().neq('id', '');
		await supabase.from('contacts').delete().neq('id', '');
		await supabase.from('offices').delete().neq('id', '');
		await supabase.from('links').delete().neq('id', '');
		await supabase.from('addresses').delete().neq('id', '');
		await supabase.from('user_groups').delete().neq('id', '');
		await supabase.from('user_preferences').delete().neq('id', '');
		await supabase.from('user_emails').delete().neq('id', '');
		await supabase.from('users').delete().neq('id', '');
		console.log('✓ Cleaned existing data\n');

		// Step 1: Migrate Users
		console.log('👥 Migrating users...');
		await migrateUsers(users);
		console.log('✓ Users migrated\n');

		// Step 2: Create address and link lookup tables for deduplication
		console.log('📍 Migrating addresses and links...');
		const { addressMap, linkMap } = await migrateAddressesAndLinks(offices, contacts);
		console.log(`✓ Addresses and links migrated\n`);

		// Step 3: Migrate Offices
		console.log('🏢 Migrating offices...');
		await migrateOffices(validOffices, addressMap, linkMap);
		console.log('✓ Offices migrated\n');

		// Step 4: Migrate Contacts
		console.log('👤 Migrating contacts...');
		await migrateContacts(validContacts, addressMap, linkMap);
		console.log('✓ Contacts migrated\n');

		// Step 5: Migrate Projects
		console.log('🎬 Migrating projects...');
		await migrateProjects(validProjects, linkMap);
		console.log('✓ Projects migrated\n');

		// Step 6: Migrate Past Projects
		console.log('📦 Migrating past projects...');
		await migratePastProjects(validPastProjects, linkMap);
		console.log('✓ Past projects migrated\n');

		// Step 7: Create relationships (after all entities exist)
		console.log('🔗 Creating relationships...');
		await createOfficeContactRelationships(validOffices, validContacts);
		await createOfficeProjectRelationships(validOffices, validProjects, validPastProjects);
		await createContactProjectRelationships(validContacts, validProjects, validPastProjects);
		console.log('✓ Relationships created\n');

		// Step 8: Migrate Comments
		console.log('💬 Migrating comments...');
		await migrateComments(validComments);
		console.log('✓ Comments migrated\n');

		// Step 9: Migrate Statistics (if any)
		if (Array.isArray(statistics) && statistics.length > 0) {
			console.log('📊 Migrating statistics...');
			await migrateStatistics(statistics);
			console.log('✓ Statistics migrated\n');
		}

		console.log('✅ Migration completed successfully!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	}
}

async function migrateUsers(users: any[]) {
	const usersToInsert = users.map((user) => ({
		id: user._id,
		username: user.username || null,
		display_name: user.displayName,
		slug: user.slug,
		email: user.email || null,
		email_hash: user.emailHash || null,
		is_admin: user.isAdmin || false,
		locale: user.locale || 'en',
		bio: user.bio || null,
		html_bio: user.htmlBio || null,
		website: user.website || null,
		twitter_username: user.twitterUsername || null,
		created_at: mongoDateToISO(user.createdAt),
		updated_at: user.updatedAt ? mongoDateToISO(user.updatedAt) : null,
		auth_methods: user.services
			? { has_password: !!user.services.password, has_github: !!user.services.github }
			: null
	}));

	const { error } = await supabase.from('users').insert(usersToInsert);
	if (error) throw error;

	// Insert user emails
	const emailsToInsert = users.flatMap((user) =>
		(user.emails || []).map((email: any) => ({
			user_id: user._id,
			address: email.address,
			verified: email.verified || false,
			is_primary: email.primary || false
		}))
	);

	if (emailsToInsert.length > 0) {
		const { error: emailError } = await supabase.from('user_emails').insert(emailsToInsert);
		if (emailError) throw emailError;
	}

	// Insert user preferences
	const preferencesToInsert = users.map((user) => ({
		user_id: user._id,
		notifications_comments: user.notifications_comments !== false,
		notifications_posts: user.notifications_posts !== false,
		notifications_replies: user.notifications_replies !== false,
		notifications_users: user.notifications_users === true
	}));

	const { error: prefError } = await supabase.from('user_preferences').insert(preferencesToInsert);
	if (prefError) throw prefError;

	// Insert user groups
	const groupsToInsert = users.flatMap((user) =>
		(user.groups || []).map((group: string) => ({
			user_id: user._id,
			group_name: group
		}))
	);

	if (groupsToInsert.length > 0) {
		const { error: groupError } = await supabase.from('user_groups').insert(groupsToInsert);
		if (groupError) throw groupError;
	}
}

async function migrateAddressesAndLinks(offices: any[], contacts: any[]) {
	const addressMap = new Map<string, number>(); // Map from stringified address to DB id
	const linkMap = new Map<string, number>(); // Map from stringified link to DB id

	// Collect all unique addresses (filter out invalid ones)
	const addressesSet = new Map<string, Address>();
	[...offices, ...contacts].forEach((entity) => {
		(entity.addresses || []).forEach((addr: Address) => {
			// Skip addresses without required city/state
			if (!addr.city || !addr.state) {
				console.warn(`⚠️  Skipping invalid address: ${JSON.stringify(addr)}`);
				return;
			}
			const key = JSON.stringify(addr);
			if (!addressesSet.has(key)) {
				addressesSet.set(key, addr);
			}
		});
	});

	// Insert addresses
	if (addressesSet.size > 0) {
		const addressesToInsert = Array.from(addressesSet.values()).map((addr) => ({
			street1: addr.street1 || null,
			street2: addr.street2 || null,
			city: addr.city,
			state: addr.state,
			zip: addr.zip || null,
			address_type: addr.addressType || null,
			location: addr.location || null
		}));

		const { data: insertedAddresses, error: addressError } = await supabase
			.from('addresses')
			.insert(addressesToInsert)
			.select('id');

		if (addressError && addressError.code !== '23505') throw addressError; // Ignore duplicate key errors

		// Create address map
		let addressIndex = 0;
		addressesSet.forEach((addr, key) => {
			if (insertedAddresses?.[addressIndex]) {
				addressMap.set(key, insertedAddresses[addressIndex].id);
				addressIndex++;
			}
		});
	}

	// Collect all unique links
	const linksSet = new Map<string, Link>();
	[...offices, ...contacts].forEach((entity) => {
		(entity.links || []).forEach((link: Link) => {
			const key = JSON.stringify(link);
			if (!linksSet.has(key)) {
				linksSet.set(key, link);
			}
		});
	});

	// Insert links
	if (linksSet.size > 0) {
		const linksToInsert = Array.from(linksSet.values()).map((link) => ({
			platform_name: link.platformName,
			profile_name: link.profileName,
			profile_link: link.profileLink
		}));

		const { data: insertedLinks, error: linkError } = await supabase
			.from('links')
			.insert(linksToInsert)
			.select('id');

		if (linkError && linkError.code !== '23505') throw linkError; // Ignore duplicate key errors

		// Create link map
		let linkIndex = 0;
		linksSet.forEach((link, key) => {
			if (insertedLinks?.[linkIndex]) {
				linkMap.set(key, insertedLinks[linkIndex].id);
				linkIndex++;
			}
		});
	}

	return { addressMap, linkMap };
}

async function migrateOffices(
	offices: any[],
	addressMap: Map<string, number>,
	linkMap: Map<string, number>
) {
	const officesToInsert = offices.map((office) => ({
		id: office._id,
		display_name: office.displayName,
		slug: office.slug,
		user_id: office.userId,
		body: office.body || null,
		html_body: office.htmlBody || null,
		created_at: mongoDateToISO(office.createdAt),
		updated_at: office.updatedAt ? mongoDateToISO(office.updatedAt) : null
	}));

	const { error } = await supabase.from('offices').insert(officesToInsert);
	if (error) throw error;

	// Insert office addresses
	const officeAddressesToInsert: any[] = [];
	offices.forEach((office) => {
		(office.addresses || []).forEach((addr: Address) => {
			const addressKey = JSON.stringify(addr);
			const addressId = addressMap.get(addressKey);
			if (addressId) {
				officeAddressesToInsert.push({
					office_id: office._id,
					address_id: addressId
				});
			}
		});
	});

	if (officeAddressesToInsert.length > 0) {
		const { error: addrError } = await supabase
			.from('office_addresses')
			.insert(officeAddressesToInsert);
		if (addrError) throw addrError;
	}

	// Insert office phones
	const officePhonesToInsert = offices.flatMap((office) =>
		(office.phones || []).map((phone: any) => ({
			office_id: office._id,
			phone_number_as_input: phone.phoneNumberAsInput || null,
			phone_number_type: phone.phoneNumberType || null,
			phone_number: phone.phoneNumber || null,
			national_format: phone.nationalFormat || null,
			country_code: phone.countryCode || null
		}))
	);

	if (officePhonesToInsert.length > 0) {
		const { error: phoneError } = await supabase.from('office_phones').insert(officePhonesToInsert);
		if (phoneError) throw phoneError;
	}

	// Insert office links
	const officeLinksToInsert: any[] = [];
	offices.forEach((office) => {
		(office.links || []).forEach((link: Link) => {
			const linkKey = JSON.stringify(link);
			const linkId = linkMap.get(linkKey);
			if (linkId) {
				officeLinksToInsert.push({
					office_id: office._id,
					link_id: linkId
				});
			}
		});
	});

	if (officeLinksToInsert.length > 0) {
		const { error: linkError } = await supabase.from('office_links').insert(officeLinksToInsert);
		if (linkError) throw linkError;
	}
}

async function migrateContacts(
	contacts: any[],
	addressMap: Map<string, number>,
	linkMap: Map<string, number>
) {
	const contactsToInsert = contacts.map((contact) => ({
		id: contact._id,
		display_name: contact.displayName,
		first_name: contact.firstName || null,
		last_name: contact.lastName || null,
		title: contact.title || null,
		gender: contact.gender || null,
		slug: contact.slug,
		user_id: contact.userId,
		the_address: contact.theAddress || null,
		address_string: contact.addressString || null,
		body: contact.body || null,
		html_body: contact.htmlBody || null,
		created_at: mongoDateToISO(contact.createdAt),
		updated_at: contact.updatedAt ? mongoDateToISO(contact.updatedAt) : null
	}));

	const { error } = await supabase.from('contacts').insert(contactsToInsert);
	if (error) throw error;

	// Insert contact addresses
	const contactAddressesToInsert: any[] = [];
	contacts.forEach((contact) => {
		(contact.addresses || []).forEach((addr: Address) => {
			const addressKey = JSON.stringify(addr);
			const addressId = addressMap.get(addressKey);
			if (addressId) {
				contactAddressesToInsert.push({
					contact_id: contact._id,
					address_id: addressId
				});
			}
		});
	});

	if (contactAddressesToInsert.length > 0) {
		const { error: addrError } = await supabase
			.from('contact_addresses')
			.insert(contactAddressesToInsert);
		if (addrError) throw addrError;
	}

	// Insert contact links
	const contactLinksToInsert: any[] = [];
	contacts.forEach((contact) => {
		(contact.links || []).forEach((link: Link) => {
			const linkKey = JSON.stringify(link);
			const linkId = linkMap.get(linkKey);
			if (linkId) {
				contactLinksToInsert.push({
					contact_id: contact._id,
					link_id: linkId
				});
			}
		});
	});

	if (contactLinksToInsert.length > 0) {
		const { error: linkError } = await supabase.from('contact_links').insert(contactLinksToInsert);
		if (linkError) throw linkError;
	}
}

async function migrateProjects(projects: any[], linkMap: Map<string, number>) {
	// Make slugs unique by appending a counter if there are duplicates
	const slugCounts = new Map<string, number>();
	projects.forEach((project) => {
		const count = (slugCounts.get(project.slug) || 0) + 1;
		slugCounts.set(project.slug, count);
	});

	const slugUsage = new Map<string, number>();
	const projectsToInsert = projects.map((project) => {
		let slug = project.slug;
		const count = slugUsage.get(project.slug) || 0;
		slugUsage.set(project.slug, count + 1);

		if (slugCounts.get(project.slug)! > 1 && count > 0) {
			slug = `${project.slug}-${count}`;
			console.warn(
				`⚠️  Slug conflict "${project.slug}" for project ${project._id}, using "${slug}"`
			);
		}

		return {
			id: project._id,
			project_title: project.projectTitle,
			slug: slug,
			user_id: project.userId,
			project_type: project.projectType || null,
			union: project.union || null,
			network: project.network || null,
			status: project.status || null,
			platform_type: project.platformType || null,
			website: project.website || null,
			season: project.season || null,
			order: project.order || null,
			renewed: project.renewed || null,
			shooting_location: project.shootingLocation || null,
			summary: project.summary || null,
			html_summary: project.htmlSummary || null,
			notes: project.notes || null,
			html_notes: project.htmlNotes || null,
			casting_company: project.castingCompany || null,
			sort_title: project.sortTitle || null,
			created_at: mongoDateToISO(project.createdAt),
			updated_at: project.updatedAt ? mongoDateToISO(project.updatedAt) : null
		};
	});

	const { error } = await supabase.from('projects').insert(projectsToInsert);
	if (error) throw error;

	// Insert project links
	const projectLinksToInsert: any[] = [];
	projects.forEach((project) => {
		(project.links || []).forEach((link: Link) => {
			const linkKey = JSON.stringify(link);
			const linkId = linkMap.get(linkKey);
			if (linkId) {
				projectLinksToInsert.push({
					project_id: project._id,
					link_id: linkId
				});
			}
		});
	});

	if (projectLinksToInsert.length > 0) {
		const { error: linkError } = await supabase.from('project_links').insert(projectLinksToInsert);
		if (linkError) throw linkError;
	}
}

async function migratePastProjects(pastProjects: any[], linkMap: Map<string, number>) {
	// Make slugs unique by appending a counter if there are duplicates
	const slugCounts = new Map<string, number>();
	pastProjects.forEach((project) => {
		const count = (slugCounts.get(project.slug) || 0) + 1;
		slugCounts.set(project.slug, count);
	});

	const slugUsage = new Map<string, number>();
	const pastProjectsToInsert = pastProjects.map((project) => {
		let slug = project.slug;
		const count = slugUsage.get(project.slug) || 0;
		slugUsage.set(project.slug, count + 1);

		if (slugCounts.get(project.slug)! > 1 && count > 0) {
			slug = `${project.slug}-${count}`;
			console.warn(
				`⚠️  Slug conflict "${project.slug}" for past project ${project._id}, using "${slug}"`
			);
		}

		return {
			id: project._id,
			project_title: project.projectTitle,
			slug: slug,
			user_id: project.userId,
			project_type: project.projectType || null,
			union: project.union || null,
			network: project.network || null,
			status: project.status || null,
			platform_type: project.platformType || null,
			website: project.website || null,
			season: project.season || null,
			order: project.order || null,
			renewed: project.renewed || null,
			shooting_location: project.shootingLocation || null,
			summary: project.summary || null,
			html_summary: project.htmlSummary || null,
			notes: project.notes || null,
			html_notes: project.htmlNotes || null,
			casting_company: project.castingCompany || null,
			sort_title: project.sortTitle || null,
			created_at: mongoDateToISO(project.createdAt),
			updated_at: project.updatedAt ? mongoDateToISO(project.updatedAt) : null
		};
	});

	const { error } = await supabase.from('past_projects').insert(pastProjectsToInsert);
	if (error) throw error;

	// Insert past project links
	const pastProjectLinksToInsert: any[] = [];
	pastProjects.forEach((project) => {
		(project.links || []).forEach((link: Link) => {
			const linkKey = JSON.stringify(link);
			const linkId = linkMap.get(linkKey);
			if (linkId) {
				pastProjectLinksToInsert.push({
					project_id: project._id,
					link_id: linkId
				});
			}
		});
	});

	if (pastProjectLinksToInsert.length > 0) {
		const { error: linkError } = await supabase
			.from('past_project_links')
			.insert(pastProjectLinksToInsert);
		if (linkError) throw linkError;
	}
}

async function createOfficeContactRelationships(offices: any[], contacts: any[]) {
	const validContactIds = new Set(contacts.map((c) => c._id));

	const officeContactsToInsert: any[] = [];
	const seenPairs = new Set<string>();
	offices.forEach((office) => {
		(office.contacts || []).forEach((contact: any) => {
			if (validContactIds.has(contact.contactId)) {
				const key = `${office._id}|${contact.contactId}`;
				if (!seenPairs.has(key)) {
					seenPairs.add(key);
					officeContactsToInsert.push({
						office_id: office._id,
						contact_id: contact.contactId
					});
				}
			}
		});
	});

	if (officeContactsToInsert.length > 0) {
		const { error } = await supabase.from('office_contacts').insert(officeContactsToInsert);
		if (error) throw error;
	}
}

async function createOfficeProjectRelationships(
	offices: any[],
	projects: any[],
	pastProjects: any[]
) {
	const validProjectIds = new Set(projects.map((p) => p._id));
	const validPastProjectIds = new Set(pastProjects.map((p) => p._id));

	const officeProjectsToInsert: any[] = [];
	const officePastProjectsToInsert: any[] = [];
	const seenProjectPairs = new Set<string>();
	const seenPastProjectPairs = new Set<string>();

	offices.forEach((office) => {
		(office.projects || []).forEach((project: any) => {
			if (validProjectIds.has(project.projectId)) {
				const key = `${office._id}|${project.projectId}`;
				if (!seenProjectPairs.has(key)) {
					seenProjectPairs.add(key);
					officeProjectsToInsert.push({
						office_id: office._id,
						project_id: project.projectId
					});
				}
			}
		});

		(office.pastProjects || []).forEach((project: any) => {
			if (validPastProjectIds.has(project.projectId)) {
				const key = `${office._id}|${project.projectId}`;
				if (!seenPastProjectPairs.has(key)) {
					seenPastProjectPairs.add(key);
					officePastProjectsToInsert.push({
						office_id: office._id,
						project_id: project.projectId
					});
				}
			}
		});
	});

	if (officeProjectsToInsert.length > 0) {
		const { error } = await supabase.from('office_projects').insert(officeProjectsToInsert);
		if (error) throw error;
	}

	if (officePastProjectsToInsert.length > 0) {
		const { error } = await supabase
			.from('office_past_projects')
			.insert(officePastProjectsToInsert);
		if (error) throw error;
	}
}

async function createContactProjectRelationships(
	contacts: any[],
	projects: any[],
	pastProjects: any[]
) {
	const validProjectIds = new Set(projects.map((p) => p._id));
	const validPastProjectIds = new Set(pastProjects.map((p) => p._id));

	const contactProjectsToInsert: any[] = [];
	const contactPastProjectsToInsert: any[] = [];
	const seenContactProjectPairs = new Set<string>();
	const seenContactPastProjectPairs = new Set<string>();

	contacts.forEach((contact) => {
		(contact.projects || []).forEach((project: any) => {
			if (validProjectIds.has(project.projectId)) {
				const key = `${contact._id}|${project.projectId}`;
				if (!seenContactProjectPairs.has(key)) {
					seenContactProjectPairs.add(key);
					contactProjectsToInsert.push({
						contact_id: contact._id,
						project_id: project.projectId,
						title_for_project: project.titleForProject || null
					});
				}
			}
		});

		(contact.pastProjects || []).forEach((project: any) => {
			if (validPastProjectIds.has(project.projectId)) {
				const key = `${contact._id}|${project.projectId}`;
				if (!seenContactPastProjectPairs.has(key)) {
					seenContactPastProjectPairs.add(key);
					contactPastProjectsToInsert.push({
						contact_id: contact._id,
						project_id: project.projectId,
						title_for_project: project.titleForProject || null
					});
				}
			}
		});
	});

	if (contactProjectsToInsert.length > 0) {
		const { error } = await supabase.from('contact_projects').insert(contactProjectsToInsert);
		if (error) throw error;
	}

	if (contactPastProjectsToInsert.length > 0) {
		const { error } = await supabase
			.from('contact_past_projects')
			.insert(contactPastProjectsToInsert);
		if (error) throw error;
	}
}

async function migrateComments(comments: any[]) {
	const commentsToInsert = comments.map((comment) => ({
		id: comment._id,
		body: comment.body,
		html_body: comment.htmlBody || null,
		collection_name: comment.collectionName,
		object_id: comment.objectId,
		user_id: comment.userId,
		parent_comment_id: comment.parentCommentId || null,
		top_level_comment_id: comment.topLevelCommentId || null,
		created_at: mongoDateToISO(comment.createdAt),
		posted_at: comment.postedAt ? mongoDateToISO(comment.postedAt) : null
	}));

	const { error } = await supabase.from('comments').insert(commentsToInsert);
	if (error) throw error;
}

async function migrateStatistics(statistics: any[]) {
	const statsToInsert = statistics.map((stat) => ({
		id: stat._id || `stat-${Date.now()}`,
		data: stat.data || stat,
		created_at: stat.createdAt ? mongoDateToISO(stat.createdAt) : new Date().toISOString()
	}));

	const { error } = await supabase.from('statistics').insert(statsToInsert);
	if (error) throw error;
}

// Run migration
migrate();
