import { z } from 'zod';
import { MongoDBDateSchema } from './common';

// Email entry schema
const EmailSchema = z.object({
	address: z.string().email(),
	verified: z.boolean(),
	primary: z.boolean().optional()
});

// Login token schema - for tracking active sessions
const LoginTokenSchema = z.object({
	when: MongoDBDateSchema,
	hashedToken: z.string()
});

// Services schema - authentication and session management
const ServicesSchema = z.object({
	password: z
		.object({
			bcrypt: z.string()
		})
		.optional(),
	github: z
		.object({
			id: z.number(),
			accessToken: z.string(),
			email: z.string().email(),
			username: z.string(),
			emails: z
				.array(
					z.object({
						email: z.string().email(),
						primary: z.boolean().optional(),
						verified: z.boolean().optional(),
						visibility: z.string().nullable().optional()
					})
				)
				.optional()
		})
		.optional(),
	resume: z
		.object({
			loginTokens: z.array(LoginTokenSchema)
		})
		.optional(),
	email: z
		.object({
			verificationTokens: z.array(z.any())
		})
		.optional()
});

// User profile schema (from OAuth services like GitHub)
const ProfileSchema = z
	.object({
		name: z.string().optional()
	})
	.optional();

// Main User schema
export const UserSchema = z.object({
	_id: z.string(),
	// Basic identity
	username: z.string().optional(),
	displayName: z.string(),
	slug: z.string(),
	// Email information
	email: z.string().email().optional(),
	emails: z.array(EmailSchema).optional(),
	emailHash: z.string().optional(),
	// Profile content
	bio: z.string().optional(),
	htmlBio: z.string().optional(),
	website: z.string().url().optional(),
	twitterUsername: z.string().optional(),
	// Authentication and sessions
	services: ServicesSchema.optional(),
	profile: ProfileSchema,
	// Permissions and settings
	isAdmin: z.boolean().default(false),
	locale: z.string().default('en'),
	groups: z.array(z.string()).optional(),
	// Notification preferences
	notifications_comments: z.boolean().optional(),
	notifications_posts: z.boolean().optional(),
	notifications_replies: z.boolean().optional(),
	notifications_users: z.boolean().optional(),
	// Timestamps
	createdAt: MongoDBDateSchema,
	updatedAt: MongoDBDateSchema.optional()
});

// Infer the TypeScript type from the schema
export type User = z.infer<typeof UserSchema>;
