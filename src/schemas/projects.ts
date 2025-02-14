import { type SchemaContext, z as zod } from 'astro:content';

export const projectsSchema = ({ image }: SchemaContext) =>
	zod.object({
		title: zod.string().describe('The project title displayed in the projects list.'),
		status: zod.enum(['finished', 'ongoing']).describe('The project status.'),
		createdAt: zod.date().describe('The project creation date.'),
		updatedAt: zod.date().optional().describe('The project last update date.'),
		version: zod.string().optional().describe('The project version.'),
		url: zod.string().url().optional().describe('The project URL.'),
		draft: zod.boolean().optional().describe('Whether the is a draft or not.'),

		image: image().optional().describe('The project icon/image.'),
		imageAlt: zod.string().optional().describe('The project image alt text.'),
		themeImages: zod.record(zod.string(), image()).optional().describe('A list of images for diferent themes.'),

		techStack: zod.array(zod.string()).optional().describe('The project technologies used.'),
		repository: zod.string().url().optional().describe('The project repository.')
	});
