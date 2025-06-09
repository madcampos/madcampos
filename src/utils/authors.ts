import { getCollection, getEntry, render } from 'astro:content';

export async function listAllAuthors() {
	const collectionEntries = await getCollection('authors');
	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => first.data.name.localeCompare(second.data.name, 'en-US', { usage: 'sort' }))
		.map((author) => ({
			...author,
			render: async () => render(author)
		}));

	return entries;
}

export async function getAuthor(authorId: string) {
	const author = await getEntry('authors', authorId);

	return {
		...author,
		render: async () => render(author)
	};
}
