// TODO: refactor
import { getCollection, render } from 'astro:content';
import { inlineMarkdownRender } from './markdown.ts';

export async function listAllTalks() {
	const collectionEntries = await getCollection('talks');

	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => (second.data.date?.getTime() ?? 0) - (first.data.date?.getTime() ?? 0) || first.data.title.localeCompare(second.data.title, 'en-US'))
		.map((entry) => ({
			...entry,
			data: {
				...entry.data,
				title: inlineMarkdownRender(entry.data.title),
				summary: inlineMarkdownRender(entry.data.summary),
				event: entry.data.event ? inlineMarkdownRender(entry.data.event) : undefined
			},
			render: async () => render(entry)
		}));

	return entries;
}
