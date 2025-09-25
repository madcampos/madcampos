/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Token, type Tokens, Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import type { ImageHandlingFunction } from './TemplateRenderer.ts';

export interface MarkdownEntry<T> {
	id: string;
	metadata?: T;
	contents: string;
}

export interface CollectionsOptions {
	/**
	 * The folder where collections will be stored.
	 * @default '_data'
	 */
	collectionsFolder?: string;

	/**
	 * The JSON file, inside the collections folder containing the collections listing.
	 *
	 * It should be an object where each key is the collection name.
	 * The values are arrays of strings, where each item is the path to an entry in that collection.
	 *
	 * The entry paths is relative to the collections folder.
	 * @default 'index.json'
	 */
	collectionsIndexFile?: string;

	/**
	 * The name of the property to look in the Front Matter metadata for an image.
	 * @default 'image'
	 */
	metadataImageProperty?: string;

	/**
	 * The base path for public assets. This is where all collection assets will be saved.
	 * @default '_assets'
	 */
	publicAssetsPath?: string;

	/**
	 * An array of sizes to optimize images for, it will be used to generate a `srcset` for the image.
	 * @default [128, 256, 512]
	 */
	imageSizes?: number[];

	/**
	 * A function to handle image transformations.
	 * @see {@link ImageHandlingFunction}
	 */
	imageHandling?: ImageHandlingFunction;

	/**
	 * The quality to use for image processing.
	 * @default 75
	 */
	imageQuality?: number;
}

export class Collections {
	#COLLECTIONS_URL: URL;
	#COLLECTIONS_INDEX_URL: URL;
	#PUBLIC_ASSETS_URL: URL;
	#metadataImageProperty = 'image';
	#collections!: Record<string, string[]>;
	#collectionsCache: Record<string, MarkdownEntry<any>> = {};
	#assetPathMap: Record<string, string> = {};
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageSizes = [128, 256, 512];
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageQuality = 75;
	#imageHandling?: ImageHandlingFunction;

	constructor({
		collectionsFolder,
		collectionsIndexFile,
		metadataImageProperty,
		publicAssetsPath,
		imageSizes,
		imageHandling,
		imageQuality
	}: CollectionsOptions = {}) {
		this.#imageHandling = imageHandling;
		this.#imageSizes = imageSizes ?? this.#imageSizes;
		this.#imageQuality = imageQuality ?? this.#imageQuality;
		this.#metadataImageProperty = metadataImageProperty ?? this.#metadataImageProperty;

		this.#COLLECTIONS_URL = new URL(collectionsFolder ?? '_data', 'https://assets.local/');
		this.#COLLECTIONS_INDEX_URL = new URL(collectionsIndexFile ?? 'index.json', this.#COLLECTIONS_URL);
		this.#PUBLIC_ASSETS_URL = new URL(publicAssetsPath ?? '_assets', this.#COLLECTIONS_URL);
	}

	async #initCollections(assets: Env['Assets']) {
		if (!this.#collections) {
			const response = await assets.fetch(this.#COLLECTIONS_INDEX_URL);

			if (!response.ok) {
				throw new Error(`Failed to fetch collection index file at: ${this.#COLLECTIONS_INDEX_URL.pathname}`);
			}

			const collections = await response.json<Record<string, string[]>>();

			this.#collections = {};
			Object.entries(collections).forEach(([collection, files]) => {
				this.#collections[collection] = files;
			});
		}
	}

	#getAssetPublicPath(assetPath: string) {
		const [publicPath] = Object.entries(this.#assetPathMap).find(([, privatePath]) => privatePath === assetPath) ?? [];

		if (publicPath) {
			return publicPath;
		}

		// TODO: skip random part?
		const [extension] = /\.[a-z0-9]+?$/iu.exec(assetPath) ?? ['.bin'];
		const newPublicPath = new URL(`${crypto.randomUUID()}${extension}`, this.#PUBLIC_ASSETS_URL).pathname;

		this.#assetPathMap[newPublicPath] = assetPath;

		return newPublicPath;
	}

	#resolveImagePath(filePath: string, imagePath: string) {
		const entryUrl = new URL(filePath, this.#COLLECTIONS_URL);
		const imagePrivateUrl = new URL(imagePath, entryUrl);

		if (entryUrl.host === imagePrivateUrl.host) {
			return this.#getAssetPublicPath(imagePrivateUrl.pathname);
		}

		return imagePrivateUrl.href;
	}

	async #renderMarkdown<T>(assets: Env['Assets'], entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: T | undefined;
		const { groups: { id } = {} } = /\/(?<id>[^/]+?)\.[a-z0-9]+?$/isu.exec(entryPath) ?? {};

		if (frontmatter) {
			metadata = parseYaml(frontmatter) as T;

			// @ts-expect-error
			const imageProperty: string | undefined = metadata?.[this.#metadataImageProperty];
			if (imageProperty) {
				// @ts-expect-error
				metadata[this.#metadataImageProperty] = this.#resolveImagePath(entryPath, imageProperty);
			}
		}

		const marked = new Marked({
			async: true,
			breaks: true,
			gfm: true
		});

		marked.use({
			extensions: [{
				name: 'imageOptimization',
				level: 'block',
				start: (src) => src.indexOf('!['),
				tokenizer: (src) => {
					const rule = /!\[(?<alt>.+?)\]\((?<href>.+?)\)/iu;
					const match = rule.exec(src);

					if (!match) {
						return;
					}

					return {
						type: 'imageOptimization',
						raw: match[0],
						href: match.groups?.['href'],
						text: match.groups?.['alt'],
						html: ''
					};
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: async (token: Token & { html: string, href: string, text: string }) => {
				if (token.type !== 'imageOptimization') {
					return;
				}

				// TODO: change path for optimized image?
				const imagePath = this.#resolveImagePath(entryPath, token.href ?? '');
				const newSrc = (await this.#imageHandling?.(assets, {
					type: 'src',
					src: imagePath,
					dest: imagePath,
					quality: this.#imageQuality,
					density: 1
				})) ?? imagePath;

				// TODO: add image sizes
				token.html = `<img src="${imagePath}" alt="${token.text ?? ''}" loading="lazy" decoding="async" />`;
			}
		});

		// TODO: add shiki plugin
		// TODO: add definition lists
		// TODO: add support for subscript
		// TODO: add support for superscript
		// TODO: add support for footnotes
		// TODO: add support for highlighting
		// TODO: add support for underline
		// TODO: convert embedded content to custom elements

		const contents = await marked.parse(markdown ?? '');

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return {
			id,
			metadata,
			contents
		} as MarkdownEntry<T>;
	}

	async list<T>(assets: Env['Assets'], collectionName: string) {
		await this.#initCollections(assets);

		const collection = this.#collections[collectionName];

		if (!collection) {
			return {} satisfies Record<string, MarkdownEntry<T>>;
		}

		const results: Record<string, MarkdownEntry<T>> = {};

		for (const file of collection) {
			results[file] = await this.get<T>(assets, collectionName, file);
		}

		return results;
	}

	async get<T>(assets: Env['Assets'], collectionName: string, entry: string) {
		await this.#initCollections(assets);

		if (!this.#collections[collectionName]?.find((filePath) => entry === filePath)) {
			throw new Error(`Invalid entry "${entry}" on collection "${collectionName}"`);
		}

		if (!this.#collectionsCache[entry]) {
			const entryUrl = new URL(entry, this.#COLLECTIONS_URL);
			const response = await assets.fetch(entryUrl);

			if (!response.ok) {
				throw new Error(`Failed to fetch entry at: "${entryUrl.pathname}"`);
			}

			const text = await response.text();
			const markdownEntry = await this.#renderMarkdown<T>(assets, entryUrl.pathname, text);

			this.#collectionsCache[entry] = markdownEntry;
		}

		return this.#collectionsCache[entry] as MarkdownEntry<T>;
	}

	async getAsset(assets: Env['Assets'], assetPath: string) {
		const assetPrivatePath = this.#assetPathMap[assetPath];

		if (!assetPrivatePath) {
			return new Response(`Asset does not exist: "${assetPath}"`, { status: 404 });
		}

		return assets.fetch(new URL(assetPrivatePath, 'https://assets.local/'));
	}
}
