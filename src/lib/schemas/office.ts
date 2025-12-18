import { z } from 'zod';
import {
	MongoDBDateSchema,
	AddressSchema,
	LinkSchema,
	ContactRefSchema,
	ProjectRefSchema
} from './common';
export type { Address, Link, ContactRef, ProjectRef } from './common';

// Phone schema
const PhoneSchema = z.object({
	phoneNumberAsInput: z.string(),
	phoneNumberType: z.string(),
	phoneNumber: z.string(),
	nationalFormat: z.string(),
	countryCode: z.string().optional()
});

// Main Office schema
export const OfficeSchema = z.object({
	_id: z.string(),
	displayName: z.string(),
	slug: z.string(),
	userId: z.string(),
	createdAt: MongoDBDateSchema,
	updatedAt: MongoDBDateSchema.optional(),
	addresses: z.array(AddressSchema).optional(),
	projects: z.array(ProjectRefSchema).optional(),
	pastProjects: z.array(ProjectRefSchema).optional(),
	contacts: z.array(ContactRefSchema).optional(),
	phones: z.array(PhoneSchema).optional(),
	links: z.array(LinkSchema).optional(),
	body: z.string().nullable().optional(),
	htmlBody: z.string().nullable().optional()
});

// Infer the TypeScript type from the schema
export type Office = z.infer<typeof OfficeSchema>;

// For convenience, export individual schemas
export type Phone = z.infer<typeof PhoneSchema>;
