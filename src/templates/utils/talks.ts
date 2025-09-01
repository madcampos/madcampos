import { getCollection, render } from 'astro:content';

export async function listAllTalks() {
	const collectionEntries = await getCollection('talks');

	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => (second.data.date?.getTime() ?? 0) - (first.data.date?.getTime() ?? 0) || first.data.title.localeCompare(second.data.title, 'en-US'))
		.map((entry) => ({
			...entry,
			render: async () => render(entry)
		}));

	return entries;
}
