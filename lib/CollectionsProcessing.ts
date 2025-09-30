/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Token, type Tokens, Marked } from 'marked';
import { type Node as YamlNode, parse as parseYaml } from 'yaml';
import { ImageOptimizer } from './ImageOptimizer.ts';
import type { TemplateRenderer } from './TemplateRenderer.ts';

export interface MarkdownEntry<T> {
	id: string;
	metadata?: T;
	contents: string;
}

export interface EntryTransformerParameters<T> {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	templateRenderer: TemplateRenderer;
	markdownParser: Marked;
	entry: MarkdownEntry<T>;
}

export interface CollectionsOptions {
	// TODO: add transformer functions to transform entries (similar to how utils are setup)

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
	 * An array of sizes to optimize images for, it will be used to generate a `srcset` for the image.
	 * @default [128, 256, 512]
	 */
	imageSizes?: number[];

	/**
	 * The quality to use for image processing.
	 * @default 75
	 */
	imageQuality?: number;

	/**
	 * An instance of {@link ImageOptimizer}.
	 * If it is not provided, a new instance is created.
	 */
	imageOptimizer?: ImageOptimizer;
}

export class Collections {
	#COLLECTIONS_URL: URL;
	#COLLECTIONS_INDEX_URL: URL;
	#collections!: Record<string, string[]>;
	#collectionsCache: Record<string, MarkdownEntry<any>> = {};
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageSizes = [128, 256, 512];
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageQuality = 75;

	#imageOptimizer: ImageOptimizer;

	constructor({
		collectionsFolder,
		collectionsIndexFile,
		imageSizes,
		imageQuality,
		imageOptimizer
	}: CollectionsOptions = {}) {
		this.#imageSizes = imageSizes ?? this.#imageSizes;
		this.#imageQuality = imageQuality ?? this.#imageQuality;
		this.#COLLECTIONS_URL = new URL(collectionsFolder ?? '_data', 'https://assets.local/');
		this.#COLLECTIONS_INDEX_URL = new URL(collectionsIndexFile ?? 'index.json', this.#COLLECTIONS_URL);
		this.#imageOptimizer = imageOptimizer ?? new ImageOptimizer();
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

	#processImage(filePath: string, imagePath: string, altText: string) {
		const entryUrl = new URL(filePath, this.#COLLECTIONS_URL);
		const imagePrivateUrl = new URL(imagePath, entryUrl);
		let imageSrc = imagePrivateUrl.href;

		if (entryUrl.host === imagePrivateUrl.host) {
			imageSrc = this.#imageOptimizer.addImageToCache({
				src: imagePrivateUrl.pathname,
				quality: this.#imageQuality,
				sizes: this.#imageSizes
			});
		}

		return this.#imageOptimizer.getImageHtml(imageSrc, { altText, loading: 'lazy', decoding: 'async' });
	}

	async #renderMarkdown<T>(assets: Env['Assets'], entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: Record<string, any> | undefined;
		const { groups: { id } = {} } = /\/(?<id>[^/]+?)\.[a-z0-9]+?$/isu.exec(entryPath) ?? {};

		if (frontmatter) {
			metadata = parseYaml(frontmatter) as YamlNode<T>;
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
			walkTokens: (token: Token & { html: string, href: string, text: string }) => {
				if (token.type !== 'imageOptimization') {
					return;
				}

				token.html = this.#processImage(entryPath, token.href ?? '', token.text);
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
}
