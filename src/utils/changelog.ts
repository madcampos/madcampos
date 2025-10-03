import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

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

export const sort: SortingFunction<ChangelogMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	return new Date(metaA.date).getTime() - new Date(metaB.date).getTime();
};

export const transform: TransformerFunction<ChangelogMetadata, TransformedChangelogMetadata> = async (_, { entry: { id, metadata, contents }, markdownParser, mode }) => {
	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });

	if (mode === 'production' && metadata?.draft) {
		return;
	}

	const date = metadata?.date ? new Date(metadata.date) : new Date();

	return {
		id,
		contents,
		metadata: {
			title: await markdownParser.parseInline(metadata?.versionName ? `${id} - ${metadata.versionName}` : id),
			draft: metadata?.draft ?? false,
			date: date.toISOString(),
			formattedDate: formatter.format(date)
		}
	};
};
