import { z } from 'zod';
import { ProjectSchema } from './project';

// PastProjectSchema extends ProjectSchema with castingCompany field
export const PastProjectSchema = ProjectSchema.extend({
	castingCompany: z.string().optional()
});

export type PastProject = z.infer<typeof PastProjectSchema>;
