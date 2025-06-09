import type { MarkdownInstance } from 'astro';
import { getCollection, render } from 'astro:content';

export async function listAllChangelogs() {
	const collectionEntries = await getCollection('changelog');
	const collectionFiles = import.meta.glob<MarkdownInstance<{}>>('../content/changelog/**/*.md', { eager: true });

	const entries = collectionEntries
		.filter((entry) => entry.data)
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateA.getTime() - dateB.getTime())
		.map((entry) => {
			const [, entryMarkdown] = Object.entries(collectionFiles).find(([filePath]) => filePath.includes(entry.id)) ?? [];

			return {
				...entry,
				title: entry.data.versionName ? `${entry.id} - ${entry.data.versionName}` : entry.id,
				render: async () => render(entry),
				renderString: async () => entryMarkdown?.compiledContent() ?? ''
			};
		});

	return entries;
}
