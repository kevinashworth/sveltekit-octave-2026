import { z } from 'zod';
import { MongoDBDateSchema, AddressSchema, LinkSchema, OfficeRefSchema } from './common';
export type { Address, Link, OfficeRef } from './common';

// Project with role schema
const ProjectWithRoleSchema = z.object({
	projectId: z.string(),
	projectTitle: z.string().optional(),
	titleForProject: z.string().optional()
});

// Main Contact schema
export const ContactSchema = z.object({
	_id: z.string(),
	displayName: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	title: z.string().optional(),
	gender: z.string().optional(),
	slug: z.string(),
	userId: z.string(),
	createdAt: MongoDBDateSchema,
	updatedAt: MongoDBDateSchema.optional(),
	offices: z.array(OfficeRefSchema).optional(),
	projects: z.array(ProjectWithRoleSchema).optional(),
	pastProjects: z.array(ProjectWithRoleSchema).optional(),
	links: z.array(LinkSchema).optional(),
	addresses: z.array(AddressSchema).optional(),
	theAddress: AddressSchema.optional(),
	addressString: z.string().optional(),
	body: z.string().nullable().optional(),
	htmlBody: z.string().nullable().optional()
});

// Infer the TypeScript type from the schema
export type Contact = z.infer<typeof ContactSchema>;

// For convenience, export individual schemas
export type ProjectWithRole = z.infer<typeof ProjectWithRoleSchema>;
