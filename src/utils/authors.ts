import { getCollection, getEntry, render } from 'astro:content';

export async function listAllAuthors() {
	const collectionEntries = await getCollection('authors');
	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => first.data.name.localeCompare(second.data.name, 'en-US', { usage: 'sort' }))
		.map((entry) => ({
			...entry,
			render: async () => render(entry)
		}));

	return entries;
}

export async function getAuthor(authorId: string) {
	const entry = await getEntry('authors', authorId);

	return {
		...entry,
		render: async () => render(entry)
	};
}
