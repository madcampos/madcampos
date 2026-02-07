import { getCollection } from 'astro:content';

export async function listBookmarks() {
	const collectionEntries = await getCollection('bookmarks');

	const entries = collectionEntries
		.map(({ data }) => data)
		.flat();

	return entries;
}
export async function listBlogroll() {
	const collectionEntries = await getCollection('blogroll');

	const entries = collectionEntries
		.map(({ data }) => data)
		.flat();

	return entries;
}
