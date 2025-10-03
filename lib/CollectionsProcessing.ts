/* eslint-disable @typescript-eslint/no-explicit-any */

import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import type {
	BundledLanguage,
	BundledTheme,
	LanguageInput,
	SpecialLanguage,
	SpecialTheme,
	ThemeInput
} from 'shiki';
import { parse as parseYaml } from 'yaml';
import type { ImageOptimizer } from './ImageOptimizer.ts';
import { init as initShiki } from './markdown/code.ts';
import { extension as markedHighlight } from './markdown/highlight.ts';
import { init as initImages } from './markdown/image.ts';
import { extension as markedInsertion } from './markdown/insertion.ts';
import { extension as markedSubscript } from './markdown/subscript.ts';
import { extension as markedSuperscript } from './markdown/superscript.ts';
import { basename } from './path.ts';
import type { Mode } from './StaticSiteHandler.ts';
import type { TemplateRenderer } from './TemplateRenderer.ts';

export interface MarkdownEntry<T> {
	id: string;
	path: string;
	metadata?: T;
	contents: string;
}

export interface EntryTransformerParameters<T> {
	imageOptimizer: ImageOptimizer;
	templateRenderer: TemplateRenderer;
	markdownParser: Marked;
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	collections: Collections;
	entry: MarkdownEntry<T>;
	mode: Mode;
}

export type TransformerFunction<T, R> = (assets: Env['Assets'], options: EntryTransformerParameters<T>) => MarkdownEntry<R> | Promise<MarkdownEntry<R> | undefined> | undefined;

export type SortingFunction<T> = (entryA: [string, MarkdownEntry<T>], entryB: [string, MarkdownEntry<T>]) => number;

export interface ShikiOptions {
	langs?: (BundledLanguage | LanguageInput | SpecialLanguage)[];
	themes?: Record<string, (BundledTheme | SpecialTheme | ThemeInput)>;
}

export interface CollectionsOptions {
	/**
	 * An instance of {@link ImageOptimizer}.
	 */
	imageOptimizer: ImageOptimizer;

	/**
	 * An instance of {@link TemplateRenderer}.
	 */
	templateRenderer: TemplateRenderer;

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
	 * A list of transformer functions to process collection entries.
	 * The key is the collection name, and the value is the transformer function.
	 * If the function exists, it will be called every time an entry is fetched.
	 */
	transformers?: Record<string, TransformerFunction<any, any>>;

	/**
	 * A list of sorcer functions to sort collections.
	 * The key is the collection name, and the value is the sorcer function.
	 * If the function exists, it will be called when the collection is loeaded for sorting.
	 *
	 * It should be compatible with the `Array.sort` callback function.
	 */
	sorters?: Record<string, SortingFunction<any>>;

	/**
	 * Options for configuring [Shiki](https://shiki.style/) for syntax highlighting.
	 * @see {@link BundledHighlighterOptions}
	 */
	shiki?: ShikiOptions;
}

export class Collections {
	#COLLECTIONS_URL: URL;
	#COLLECTIONS_INDEX_URL: URL;
	#collections!: Record<string, string[]>;
	#collectionsCache = new Map<string, Map<string, MarkdownEntry<any>>>();
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageSizes = [128, 256, 512];
	#transformers: Record<string, TransformerFunction<any, any>>;
	#sorters: Record<string, SortingFunction<any>>;
	#imageOptimizer: ImageOptimizer;
	#templateRenderer: TemplateRenderer;
	#shikiOptions: Required<ShikiOptions>;

	constructor({
		imageOptimizer,
		templateRenderer,
		collectionsFolder,
		collectionsIndexFile,
		imageSizes,
		transformers,
		sorters,
		shiki
	}: CollectionsOptions) {
		this.#imageOptimizer = imageOptimizer;
		this.#templateRenderer = templateRenderer;

		this.#imageSizes = imageSizes ?? this.#imageSizes;
		this.#COLLECTIONS_URL = new URL(collectionsFolder ?? '_data/', 'https://assets.local/');
		this.#COLLECTIONS_INDEX_URL = new URL(collectionsIndexFile ?? 'index.json', this.#COLLECTIONS_URL);
		this.#transformers = transformers ?? {};
		this.#sorters = sorters ?? {};

		this.#shikiOptions = {
			themes: shiki?.themes ?? {},
			langs: shiki?.langs ?? []
		};
	}

	get collectionsPath() {
		return this.#COLLECTIONS_URL.pathname;
	}

	mode: Mode = 'production';

	async #initCollections(assets: Env['Assets']) {
		if (!this.#collections) {
			const response = await assets.fetch(this.#COLLECTIONS_INDEX_URL.href);

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

	async #processImage(assets: Env['Assets'], filePath: string, imagePath: string, altText: string) {
		const entryUrl = new URL(filePath, this.#COLLECTIONS_URL);
		const imagePrivateUrl = new URL(imagePath, entryUrl);
		let newSrc = imagePrivateUrl.href;
		let srcSet = '';

		if (entryUrl.host === imagePrivateUrl.host) {
			newSrc = await this.#imageOptimizer.addImageToCache(assets, {
				src: imagePrivateUrl.pathname,
				widths: this.#imageSizes
			});

			srcSet = this.#imageOptimizer.getImageSourceSet(newSrc);
		}

		return `<img
			src="${newSrc}"
			alt="${altText}"
			loading="lazy"
			decoding="async"
			fetchpriority="low"
			referrerpolicy="no-referrer"
			srcset="${srcSet}"
			size=""
		/>`;
	}

	async #newMarkdownParser(assets: Env['Assets'], entryPath: string) {
		const marked = new Marked({
			async: true,
			breaks: true,
			gfm: true
		});

		marked.use(markedFootnote());
		marked.use(await initShiki(this.#shikiOptions));
		marked.use(markedSuperscript);
		marked.use(markedSubscript);
		marked.use(markedHighlight);
		marked.use(markedInsertion);
		marked.use(initImages(assets, this.#processImage, entryPath));

		return marked;
	}

	async #parseMarkdown<T extends Record<string, any>>(assets: Env['Assets'], entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: T | undefined;

		if (frontmatter) {
			metadata = parseYaml(frontmatter);
		}

		const marked = await this.#newMarkdownParser(assets, entryPath);

		return {
			metadata,
			contents: await marked.parse(markdown ?? '')
		};
	}

	resolveImagePath(imagePath: string, entryPath: string) {
		const entryUrl = new URL(entryPath, this.#COLLECTIONS_URL);
		const imagePrivateUrl = new URL(imagePath, entryUrl);

		return imagePrivateUrl.pathname;
	}

	stripInlineMarkdown(text: string) {
		// TODO: use marked for this?

		return text
			// Escape HTML entities
			.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
			// Bold
			.replaceAll(/\*\*(.+?)\*\*|__(.+?)__/igu, '$1$2')
			// Italics
			.replaceAll(/\*(.+?)\*|_(.+?)_/igu, '$1$2')
			// Striketrough (deleted text)
			.replaceAll(/~~(.+?)~~/igu, '$1')
			// Underline (inserted text)
			.replaceAll(/\+\+(.+?)\+\+/igu, '$1')
			// Highlight
			.replaceAll(/[=]=(.+?)==/igu, '$1')
			// Inline code
			.replaceAll(/`(.+?)`/igu, '$1')
			// Links
			.replaceAll(/\[(.*?)\]\((.*?)\)/igu, '$1');
	}

	async renderInlineMarkdown(assets: Env['Assets'], text: string) {
		const marked = await this.#newMarkdownParser(assets, '');

		return marked.parseInline(text);
	}

	async renderMarkdown<T extends Record<string, any>>(assets: Env['Assets'], entryPath: string, text: string) {
		const id = basename(new URL(entryPath, this.#COLLECTIONS_URL).pathname, '.md');
		const { contents, metadata } = await this.#parseMarkdown<T>(assets, entryPath, text);

		return {
			id,
			path: entryPath,
			metadata,
			contents
		} satisfies MarkdownEntry<T>;
	}

	async list<T extends Record<string, any>>(assets: Env['Assets'], collectionName: string) {
		await this.#initCollections(assets);

		const collection = this.#collections[collectionName];

		if (!collection) {
			return {} satisfies Record<string, MarkdownEntry<T>>;
		}

		if (!this.#collectionsCache.has(collectionName)) {
			let results: [string, MarkdownEntry<T>][] = [];

			for (const file of collection) {
				const markdownEntry = await this.get<T>(assets, collectionName, file);

				if (markdownEntry) {
					results.push([file, markdownEntry]);
				}
			}

			if (this.#sorters[collectionName]) {
				results = results.sort(this.#sorters[collectionName]);
			}

			this.#collectionsCache.set(collectionName, new Map(results));
		}

		return Object.fromEntries((this.#collectionsCache.get(collectionName) as Map<string, MarkdownEntry<T>>).entries());
	}

	async get<T extends Record<string, any>>(assets: Env['Assets'], collectionName: string, entry: string) {
		await this.#initCollections(assets);

		if (!this.#collections[collectionName]?.find((filePath) => entry === filePath)) {
			throw new Error(`Invalid entry "${entry}" on collection "${collectionName}"`);
		}

		if (this.#collectionsCache.get(collectionName)?.has(entry)) {
			return this.#collectionsCache.get(collectionName)?.get(entry) as MarkdownEntry<T>;
		}

		const entryUrl = new URL(entry, this.#COLLECTIONS_URL);
		const response = await assets.fetch(entryUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch entry at: "${entryUrl.pathname}"`);
		}

		const text = await response.text();
		let markdownEntry: MarkdownEntry<T> | undefined = await this.renderMarkdown<T>(assets, entryUrl.pathname, text);

		markdownEntry.contents = await this.#templateRenderer.renderString(assets, markdownEntry.contents);

		if (this.#transformers[collectionName]) {
			markdownEntry = await this.#transformers[collectionName](assets, {
				entry: markdownEntry,
				markdownParser: await this.#newMarkdownParser(assets, entry),
				imageOptimizer: this.#imageOptimizer,
				templateRenderer: this.#templateRenderer,
				collections: this,
				mode: this.mode
			});
		}

		return markdownEntry;
	}
}
