import { getCollection, render } from 'astro:content';

export async function listAllProjects() {
	const collectionEntries = await getCollection('projects');
	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => first.data.title.localeCompare(second.data.title))
		.map((entry) => ({
			...entry,
			render: async () => render(entry)
		}));

	return entries;
}
