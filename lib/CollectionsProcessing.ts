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
	collectionsFolder?: string;
	collectionsIndexFile?: string;
	metadataImageProperty?: string;
	relativeAssetsPath?: string;
	publicAssetsPath?: string;
	imageSizes?: number[];
	imageHandling?: ImageHandlingFunction;
	imageQuality?: number;
}

export class Collections {
	#collectionsFolder = '_data';
	#collectionsIndexFile = 'index.json';
	#metadataImageProperty = 'image';
	#relativeAssetsPath = './assets';
	#publicAssetsPath = '_assets';
	#collections!: Record<string, string[]>;
	#collectionsCache: Record<string, MarkdownEntry<any>> = {};
	#assetPathMap: Record<string, string> = {};
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageSizes = [128, 256, 512];
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#defaultImageQuality = 75;
	#imageHandling?: ImageHandlingFunction;

	constructor({
		collectionsFolder,
		collectionsIndexFile,
		metadataImageProperty,
		relativeAssetsPath,
		publicAssetsPath,
		imageSizes,
		imageHandling,
		imageQuality
	}: CollectionsOptions = {}) {
		this.#collectionsFolder = collectionsFolder ?? this.#collectionsFolder;
		this.#collectionsIndexFile = collectionsIndexFile ?? this.#collectionsIndexFile;
		this.#metadataImageProperty = metadataImageProperty ?? this.#metadataImageProperty;
		this.#relativeAssetsPath = relativeAssetsPath ?? this.#relativeAssetsPath;
		this.#publicAssetsPath = publicAssetsPath ?? this.#publicAssetsPath;
		this.#imageSizes = imageSizes ?? this.#imageSizes;
		this.#imageHandling = imageHandling;
		this.#defaultImageQuality = imageQuality ?? this.#defaultImageQuality;
	}

	async #initCollections(assets: Env['Assets']) {
		if (!this.#collections) {
			const response = await assets.fetch(`https://assets.local/${this.#collectionsFolder}/${this.#collectionsIndexFile}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch collection index file at: ${this.#collectionsFolder}/${this.#collectionsIndexFile}`);
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

		const [extension] = /\.[a-z0-9]+?$/iu.exec(assetPath) ?? ['.bin'];
		const newPublicPath = `${this.#publicAssetsPath}/${crypto.randomUUID()}${extension}`;

		this.#assetPathMap[newPublicPath] = assetPath;

		return newPublicPath;
	}

	#resolveImagePath(filePath: string, imagePath: string) {
		if (imagePath?.startsWith(this.#relativeAssetsPath)) {
			const entryFolder = filePath.replace(/\/(?:.+?)$/iu, '');
			const imagePrivatePath = `${entryFolder}/${imagePath.replace('./', '')}`;

			return this.#getAssetPublicPath(imagePrivatePath);
		}

		return imagePath;
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
					quality: this.#defaultImageQuality,
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
			const response = await assets.fetch(`https://assets.local/${this.#collectionsFolder}/${entry}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch entry at: "${this.#collectionsFolder}/${entry}"`);
			}

			const text = await response.text();
			const markdownEntry = await this.#renderMarkdown<T>(assets, `${this.#collectionsFolder}/${entry}`, text);

			this.#collectionsCache[entry] = markdownEntry;
		}

		return this.#collectionsCache[entry] as MarkdownEntry<T>;
	}

	async getAsset(assets: Env['Assets'], assetPath: string) {
		if (!assetPath.startsWith(this.#publicAssetsPath)) {
			throw new Error(`Asset path is not on public images folder: "${assetPath}"`);
		}

		const assetPrivatePath = this.#assetPathMap[assetPath];

		if (!assetPrivatePath) {
			throw new Error(`Asset does not exist: "${assetPath}"`);
		}

		return await assets.fetch(`https://assets.local/${assetPrivatePath}`);
	}
}
