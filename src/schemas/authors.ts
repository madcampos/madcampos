import { type SchemaContext, z as zod } from 'astro:content';

export const authorsSchema = ({ image }: SchemaContext) =>
	zod.object({
		name: zod.string().describe('The author name.'),

		draft: zod.boolean().optional().describe('If this author is strill a "draft".'),

		avatar: image().describe('The author avatar.'),
		avatarAlt: zod.string().describe('The author avatar alt text.'),

		email: zod.string().email().optional().describe('The author email.'),
		website: zod.string().url().optional().describe('The author site.'),

		socialMedia: zod.record(zod.string(), zod.string().url()).optional().describe('The author social media links.')
	});
