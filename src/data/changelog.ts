import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

interface OriginalChangelogMetadata {
	date: Date;
	versionName: string;
	draft?: boolean;
}

export interface ChangelogMetadata {
	title: string;
	date: string;
	formattedDate: string;
}

export const sort: SortingFunction<ChangelogMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	return new Date(metaA.date).getTime() - new Date(metaB.date).getTime();
};

export const transform: TransformerFunction<OriginalChangelogMetadata, ChangelogMetadata> = async ({
	entry: { id, path, metadata, contents },
	markdownParser,
	mode
}) => {
	if (mode === 'production' && metadata?.draft) {
		return;
	}

	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
	const date = metadata?.date ?? new Date();

	return {
		id,
		path,
		contents,
		metadata: {
			title: await markdownParser.parseInline(metadata?.versionName ? `${id} - ${metadata.versionName}` : id),
			date: date.toISOString(),
			formattedDate: formatter.format(date)
		}
	};
};
