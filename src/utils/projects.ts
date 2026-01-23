import type { MarkdownInstance } from 'astro';
import { getCollection, render } from 'astro:content';

export async function listAllProjects() {
	const collectionEntries = await getCollection('projects');
	const collectionFiles = import.meta.glob<MarkdownInstance<{}>>('../content/projects/**/*.md', { eager: true });

	const entries = collectionEntries
		.filter(({ data: { draft } }) => !draft || import.meta.env.DEV)
		.sort((first, second) => first.data.title.localeCompare(second.data.title))
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
