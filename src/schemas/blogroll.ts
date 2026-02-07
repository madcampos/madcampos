import { z as zod } from 'astro:content';

export const blogrollSchema = () =>
	zod.array(
		zod.object({
			title: zod.string().describe('The blog title.'),
			url: zod.string().url().describe('The URL for the blog.')
		})
	);
