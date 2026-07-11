import { markdown } from '@astropub/md';
import type { MarkdownInstance } from 'astro';
import { getCollection, render } from 'astro:content';

export async function listAllChangelogs() {
	const collectionEntries = await getCollection('changelog');
	// oxlint-disable-next-line typescript/no-empty-object-type
	const collectionFiles = import.meta.glob<MarkdownInstance<{}>>('../content/changelog/**/*.md', { eager: true });

	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateB.getTime() - dateA.getTime())
		.map(async (entry) => {
			const [, entryMarkdown] = Object.entries(collectionFiles).find(([filePath]) => filePath.includes(entry.id)) ?? [];

			return {
				...entry,
				title: await markdown.inline(entry.data.versionName ? `${entry.id} - ${entry.data.versionName}` : entry.id),
				render: async () => render(entry),
				renderString: async () => entryMarkdown?.compiledContent() ?? ''
			};
		});

	return Promise.all(entries);
}
