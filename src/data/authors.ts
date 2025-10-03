import type { SortingFunction, TransformerFunction } from '../../lib/CollectionsProcessing.ts';

export interface AuthorMetadata {
	name: string;
	draft?: boolean;
	avatar: string;
	avatarAlt: string;
	email?: string;
	website?: string;
	socialMedia?: Record<string, string>;
}

export const transform: TransformerFunction<AuthorMetadata, AuthorMetadata> = async (
	assets,
	{
		entry: { id, path, metadata, contents },
		imageOptimizer,
		collections,
		markdownParser,
		mode
	}
) => {
	if (mode === 'production' && metadata?.draft) {
		return;
	}

	let avatar = '';

	if (metadata?.avatar) {
		avatar = await imageOptimizer.addImageToCache(assets, {
			src: collections.resolveImagePath(metadata.avatar, path)
		}) ?? '';
	}

	return {
		id,
		path,
		contents,
		metadata: {
			...metadata,
			name: await markdownParser.parseInline(metadata?.name ?? ''),
			avatar,
			avatarAlt: collections.stripInlineMarkdown(metadata?.avatarAlt ?? '')
		}
	};
};

export const sort: SortingFunction<AuthorMetadata> = ([, { metadata: metaA }], [, { metadata: metaB }]) => {
	if (!metaA || !metaB) {
		return 0;
	}

	return metaA.name.localeCompare(metaB.name, 'en-US', { usage: 'sort' });
};
