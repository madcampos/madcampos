import { z as zod } from 'astro/zod';

export const blogrollSchema = () =>
	zod.array(
		zod.object({
			title: zod.string().describe('The blog title.'),
			url: zod.url().describe('The URL for the blog.')
		})
	);
