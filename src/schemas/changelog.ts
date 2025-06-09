import { z as zod } from 'astro:content';

export const changelogSchema = () =>
	zod.object({
		versionName: zod.string().optional().describe('The version name.'),
		date: zod.date().describe('The version release date.'),
		draft: zod.boolean().optional().describe('If this version is a draft.')
	});
