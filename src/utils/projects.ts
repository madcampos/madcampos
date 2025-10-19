// TODO: refactor
import { getCollection, render } from 'astro:content';
import { inlineMarkdownRender } from './markdown.ts';

export async function listAllProjects() {
	const collectionEntries = await getCollection('projects');
	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => first.data.title.localeCompare(second.data.title))
		.map((entry) => ({
			...entry,
			data: {
				...entry.data,
				title: inlineMarkdownRender(entry.data.title)
			},
			render: async () => render(entry)
		}));

	return entries;
}
