import { z } from 'zod';
import { MongoDBDateSchema } from './common';

// Comment schema - represents user comments on Projects, Offices, Contacts, and PastProjects
export const CommentSchema = z.object({
	_id: z.string(),
	// Comment content
	body: z.string(),
	htmlBody: z.string().optional(),
	// Reference to the object being commented on
	collectionName: z.enum(['Projects', 'Offices', 'Contacts', 'PastProjects']),
	objectId: z.string(),
	// User information
	userId: z.string(),
	// Timestamps
	createdAt: MongoDBDateSchema,
	postedAt: MongoDBDateSchema.optional(),
	// Comment threading
	parentCommentId: z.string().optional(),
	topLevelCommentId: z.string().optional()
});

// Infer the TypeScript type from the schema
export type Comment = z.infer<typeof CommentSchema>;
