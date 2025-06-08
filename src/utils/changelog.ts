import type { MarkdownInstance } from 'astro';
import { getCollection, render } from 'astro:content';

export async function listAllChangelogs() {
	const changelogEntries = await getCollection('changelog');
	const changelogs = changelogEntries.filter((changelog) => !changelog.data).sort(({ data: { date: dateA } }, { data: { date: dateB } }) => dateA.getTime() - dateB.getTime());

	const changelogFiles = import.meta.glob<MarkdownInstance<{}>>('../content/changelog/*.md', { eager: true });

	const changelogsWithRender = changelogs.map((changelog) => {
		const [, changelogMarkdown] = Object.entries(changelogFiles).find(([filePath]) => filePath.includes(changelog.id)) ?? [];

		return {
			...changelog,
			title: changelog.data.versionName ? `${changelog.id} - ${changelog.data.versionName}` : changelog.id,
			render: async () => render(changelog),
			renderString: async () => changelogMarkdown?.compiledContent() ?? ''
		};
	});

	return changelogsWithRender;
}
