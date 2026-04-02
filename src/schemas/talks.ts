import { z as zod } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

export const talksSchema = ({ image }: SchemaContext) =>
	zod.object({
		title: zod.string().describe('The talk title displayed in the talks list.'),
		summary: zod.string().describe('A summary for the talk that will show in the talks list pages.'),
		event: zod.string().optional().describe('The event the talk was given.'),
		eventUrl: zod.url().optional().describe('The event URL.'),
		isOnline: zod.boolean().describe('If the event is an online event.'),
		date: zod.date().optional().describe('The talk date.'),
		address: zod.string().optional().describe('The event address, if it is in-person.'),
		draft: zod.boolean().optional().describe('Whether the is a draft or not.'),

		image: image().optional().describe('The talk main image path, relative to the site root.'),
		imageAlt: zod.string().optional().describe('The talk main image alt text.'),

		slides: zod.url().optional().describe('The talk slides.'),
		video: zod.url().optional().describe('The talk video.'),
		code: zod.url().optional().describe('The talk code.'),
		demo: zod.url().optional().describe('The talk demo.'),
		relatedContent: zod.object({
			title: zod.string().describe('The related content title.'),
			url: zod.string().describe('The related content URL.')
		}).array().nonempty().optional().describe('The related content.'),
		techStack: zod.array(zod.string()).optional().describe('The talk technologies used.')
	});
