import type { Collections, MarkdownEntry } from '../../lib/CollectionsProcessing.ts';
import { inlineMarkdownRender } from './markdown.ts';

interface ChangelogMetadata {
	date: string;
	versionName: string;
	draft?: boolean;
}

interface TransformedChangelogMetadata {
	title: string;
	date: string;
	formattedDate: string;
	draft: boolean;
}

export async function listAllChangelogs(assets: Env['Assets'], collections: Collections, isDevMode?: boolean) {
	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });

	const collectionEntries = await collections.list<ChangelogMetadata>(assets, 'changelog');

	const existingEntries = Object.entries(collectionEntries).filter(([, { metadata }]) => metadata) as [string, Required<MarkdownEntry<ChangelogMetadata>>][];
	const nonDraftEntries = existingEntries.filter(([, { metadata }]) => !metadata.draft || isDevMode);
	const sortedEntries = nonDraftEntries.sort(([, { metadata: { date: dateA } }], [, { metadata: { date: dateB } }]) => new Date(dateA).getTime() - new Date(dateB).getTime());
	const entries = sortedEntries.map(([, { id, metadata, contents }]) => ({
		id,
		metadata: {
			title: inlineMarkdownRender(metadata.versionName ? `${id} - ${metadata.versionName}` : id),
			draft: metadata.draft ?? false,
			date: new Date(metadata.date).toISOString(),
			formattedDate: formatter.format(new Date(metadata.date))
		},
		contents
	} satisfies MarkdownEntry<TransformedChangelogMetadata>));

	return entries;
}
