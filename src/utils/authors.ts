import { getCollection, getEntry, render } from 'astro:content';

export async function listAllAuthors() {
	const authorEntries = await getCollection('authors');
	const authors = authorEntries.sort((first, second) => first.data.name.localeCompare(second.data.name, 'en-US', { usage: 'sort' }));
	const authorsWithRender = authors.map((author) => ({
		...author,
		render: async () => render(author)
	}));

	return authorsWithRender;
}

export async function getAuthor(authorId: string) {
	const author = await getEntry('authors', authorId);

	return {
		...author,
		render: async () => render(author)
	};
}
