import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

interface OriginalTalkMetadata {
	title: string;
	summary: string;
	isOnline: boolean;
	draft?: boolean;
	image?: string;
	imageAlt?: string;
	event?: string;
	eventUrl?: string;
	date?: Date;
	slides?: string;
	video?: string;
	code?: string;
	techStack: string[];
}

export interface TalkMetadata extends Omit<OriginalTalkMetadata, 'date'> {
	date: string;
	formattedDate: string;
}

export const sort: SortingFunction<TalkMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	const dateDiff = new Date(metaA.date).getTime() - new Date(metaB.date).getTime();
	const titleDiff = metaA.title.localeCompare(metaB.title, 'en-US', { usage: 'sort' });

	return dateDiff || titleDiff;
};

export const transform: TransformerFunction<OriginalTalkMetadata, TalkMetadata> = async (
	assets,
	{
		entry: { metadata, path, id, contents },
		imageOptimizer,
		markdownParser,
		collections,
		mode
	}
) => {
	if (mode === 'production' && metadata?.draft) {
		return;
	}

	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
	const date = metadata?.date ?? new Date();

	let image = '';

	if (metadata?.image) {
		image = await imageOptimizer.addImageToCache(assets, {
			src: collections.resolveImagePath(metadata.image, path)
		}) ?? '';
	}

	return {
		id,
		path,
		contents,
		metadata: {
			...metadata,
			title: await markdownParser.parseInline(metadata?.title ?? ''),
			summary: await markdownParser.parseInline(metadata?.summary ?? ''),
			event: metadata.event ? await markdownParser.parseInline(metadata?.event ?? '') : undefined,
			image,
			avatarAlt: collections.stripInlineMarkdown(metadata?.imageAlt ?? ''),
			date: date.toISOString(),
			formattedDate: formatter.format(date)
		}
	};
};
