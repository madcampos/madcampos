import type { MarkdownInstance } from 'astro';
import { getCollection, render } from 'astro:content';

export async function listAllTalks() {
	const collectionEntries = await getCollection('talks');
	const collectionFiles = import.meta.glob<MarkdownInstance<{}>>('../content/talks/**/*.md', { eager: true });

	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => (second.data.date?.getTime() ?? 0) - (first.data.date?.getTime() ?? 0) || first.data.title.localeCompare(second.data.title, 'en-US'))
		.map((entry) => {
			const [, entryMarkdown] = Object.entries(collectionFiles).find(([filePath]) => filePath.includes(entry.id)) ?? [];

			return {
				...entry,
				render: async () => render(entry),
				renderString: async () => entryMarkdown?.compiledContent() ?? ''
			};
		});

	return entries;
}
