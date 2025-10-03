import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

export interface ProjectMetadata {
	title: string;
	status: string;
	version: string;
	draft?: boolean;
	repository?: string;
	image?: string;
	imageAlt?: string;
	themeImages?: Record<string, string>;
	techStack?: string[];
}

export const transform: TransformerFunction<ProjectMetadata, ProjectMetadata> = async (
	assets,
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

	let image = '';

	if (metadata?.image) {
		image = await imageOptimizer.addImageToCache(assets, {
			src: collections.resolveImagePath(metadata.image, path)
		}) ?? '';
	}

	let themeImages: Record<string, string> | undefined;

	if (metadata?.themeImages) {
		const promises = Object.entries(metadata.themeImages)
			.map(async ([name, imagePath]) => [
				name,
				await imageOptimizer.addImageToCache(assets, {
					src: collections.resolveImagePath(imagePath, path)
				})
			]);
		const imageEntries = await Promise.all(promises);

		themeImages = Object.fromEntries(imageEntries);
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
			image,
			imageAlt: collections.stripInlineMarkdown(metadata?.imageAlt ?? ''),
			themeImages
		}
	};
};

export const sort: SortingFunction<ProjectMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	return metaA.title.localeCompare(metaB.title, 'en-US', { usage: 'sort' });
};
