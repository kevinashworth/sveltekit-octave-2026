import { z } from 'zod';
import { MongoDBDateSchema, LinkSchema, OfficeRefSchema, ContactRefSchema } from './common';
export type { Link, OfficeRef, ContactRef, ProjectRef } from './common';

// Main Project schema
export const ProjectSchema = z.object({
	_id: z.string(),
	projectTitle: z.string(),
	slug: z.string(),
	userId: z.string(),
	createdAt: MongoDBDateSchema,
	updatedAt: MongoDBDateSchema.optional(),
	// Basic project info
	projectType: z.string().optional(),
	union: z.string().optional(),
	network: z.string().optional(),
	status: z.string().optional(),
	platformType: z.string().optional(),
	website: z.string().url().optional(),
	// Season/order info
	season: z.string().optional(),
	order: z.string().optional(),
	renewed: z.boolean().optional(),
	// Locations and dates
	shootingLocation: z.string().nullable().optional(),
	// Content
	summary: z.string().optional(),
	htmlSummary: z.string().optional(),
	notes: z.string().nullable().optional(),
	htmlNotes: z.string().nullable().optional(),
	// Sort/display
	sortTitle: z.string().optional(),
	// References to other entities
	offices: z.array(OfficeRefSchema).optional(),
	contacts: z.array(ContactRefSchema).optional(),
	links: z.array(LinkSchema).optional()
});

// Infer the TypeScript type from the schema
export type Project = z.infer<typeof ProjectSchema>;
