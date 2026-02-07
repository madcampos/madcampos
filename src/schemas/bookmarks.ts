import { z as zod } from 'astro:content';

export const bookmarksSchema = () =>
	zod.array(
		zod.object({
			title: zod.string().describe('The section title.'),
			description: zod.string().describe('The section description.'),
			links: zod.array(zod.object({
				url: zod.string().url().describe('The link for the bookmark.'),
				title: zod.string().describe('The bookmark title.'),
				description: zod.string().describe('The bookmark description'),
				type: zod
					.enum(['article', 'guidelines', 'podcast', 'reference', 'tutorial', 'video', 'website'])
					.describe('The type of link this bookmark is.'),
				note: zod.string().optional().describe('A note about this item.')
			})).describe('The links for this section.')
		})
	);
