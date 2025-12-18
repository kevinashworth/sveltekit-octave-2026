import { z } from 'zod';

// MongoDB Date format schema
export const MongoDBDateSchema = z.object({
	$date: z.string().datetime()
});

// Shared Address schema (flexible to support both office and contact variations)
export const AddressSchema = z.object({
	street1: z.string().nullable().optional(),
	street2: z.string().nullable().optional(),
	city: z.string(),
	state: z.string(),
	zip: z.string().nullable().optional(),
	addressType: z.string().nullable().optional(),
	location: z.string().nullable().optional()
});

// Shared Link schema
export const LinkSchema = z.object({
	platformName: z.string(),
	profileName: z.string(),
	profileLink: z.string().url()
});

// Office reference schema (used in Project and Contact)
export const OfficeRefSchema = z.object({
	officeId: z.string(),
	officeLocation: z.string().nullable().optional(),
	officeName: z.string().nullable().optional()
});

// Contact reference schema (used in Project and Office)
export const ContactRefSchema = z.object({
	contactId: z.string(),
	contactName: z.string(),
	contactTitle: z.string().optional()
});

// Project reference schema (used in Office and Contact)
export const ProjectRefSchema = z.object({
	projectId: z.string(),
	projectTitle: z.string().optional()
});

// Infer types
export type Address = z.infer<typeof AddressSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type OfficeRef = z.infer<typeof OfficeRefSchema>;
export type ContactRef = z.infer<typeof ContactRefSchema>;
export type ProjectRef = z.infer<typeof ProjectRefSchema>;
