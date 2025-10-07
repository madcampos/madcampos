import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

interface OriginalProjectMetadata {
	title: string;
	status: 'finished' | 'ongoing';
	createdAt?: Date;
	updatedAt?: Date;
	version: string;
	url?: string;
	draft?: boolean;

	image?: string;
	imageAlt?: string;
	themeImages?: Record<string, string>;

	techStack?: string[];
	repository?: string;
}

export interface ProjectMetadata extends Omit<OriginalProjectMetadata, 'createdAt' | 'themeImages' | 'updatedAt'> {
	createdAt: string;
	formattedCreatedAt: string;
	updatedAt?: string;
	formattedUpdatedAt?: string;
	themeImages: {
		theme: string,
		src: string
	}[];
}

export const transform: TransformerFunction<OriginalProjectMetadata, ProjectMetadata> = async (
	{
		entry: { id, path, metadata, contents },
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
	const date = metadata?.createdAt ?? new Date();
	const updatedDate = metadata.updatedAt ?? date;
	let image = '';

	if (metadata?.image) {
		image = await imageOptimizer.addImageToCache({
			src: collections.resolveImagePath(metadata.image, path)
		}) ?? '';
	}

	let themeImages: { theme: string, src: string }[] = [];

	if (metadata?.themeImages) {
		const promises = Object.entries(metadata.themeImages)
			.map(async ([name, imagePath]) => ({
				theme: name,
				src: await imageOptimizer.addImageToCache({
					src: collections.resolveImagePath(imagePath, path)
				})
			}));
		themeImages = await Promise.all(promises);
	}

	return {
		id,
		path,
		contents,
		metadata: {
			...metadata,
			title: await markdownParser.parseInline(metadata?.title ?? ''),
			version: metadata?.version ?? '0.0.0',
			status: metadata?.status ?? 'prototype',
			createdAt: date.toISOString(),
			formattedCreatedAt: formatter.format(date),
			updatedAt: updatedDate.toISOString(),
			formattedUpdatedAt: formatter.format(updatedDate),
			image,
			imageAlt: await collections.stripInlineMarkdown(metadata?.imageAlt ?? ''),
			themeImages
		}
	};
};

export const sort: SortingFunction<OriginalProjectMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	return metaA.title.localeCompare(metaB.title, 'en-US', { usage: 'sort' });
};
