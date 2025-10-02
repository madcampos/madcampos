/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
	transformerRenderWhitespace
} from '@shikijs/transformers';
import { type Token, type Tokens, Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import markedShiki from 'marked-shiki';
import { createHighlighter } from 'shiki';
import { parse as parseYaml } from 'yaml';
import type { ImageOptimizer } from './ImageOptimizer.ts';
import type { TemplateRenderer } from './TemplateRenderer.ts';

export interface MarkdownEntry<T> {
	id: string;
	metadata?: T;
	contents: string;
}

export interface EntryTransformerParameters<T> {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	markdownParser: Marked;
	entry: MarkdownEntry<T>;
}

type TransformerFunction<T> = (options: EntryTransformerParameters<T>) => MarkdownEntry<T> | Promise<MarkdownEntry<T>>;

interface GetEntryParams {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	templateRenderer: TemplateRenderer;
	collectionName: string;
	entry: string;
}

interface ListEntriesParams {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	templateRenderer: TemplateRenderer;
	collectionName: string;
}

interface ProcessImageParams {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	filePath: string;
	imagePath: string;
	altText: string;
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
	 * An array of sizes to optimize images for, it will be used to generate a `srcset` for the image.
	 * @default [128, 256, 512]
	 */
	imageSizes?: number[];

	/**
	 * A list of transformer functions to process collection entries.
	 * The key is the collection name, and the value is the transformer function.
	 * If the function exists, it will be called every time an entry is fetched.
	 */
	transformers?: Record<string, TransformerFunction<any>>;
}

export class Collections {
	#COLLECTIONS_URL: URL;
	#COLLECTIONS_INDEX_URL: URL;
	#collections!: Record<string, string[]>;
	#collectionsCache: Record<string, MarkdownEntry<any>> = {};
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	#imageSizes = [128, 256, 512];
	#transformers: Record<string, TransformerFunction<any>>;

	constructor({
		collectionsFolder,
		collectionsIndexFile,
		imageSizes,
		transformers
	}: CollectionsOptions = {}) {
		this.#imageSizes = imageSizes ?? this.#imageSizes;
		this.#COLLECTIONS_URL = new URL(collectionsFolder ?? '_data/', 'https://assets.local/');
		this.#COLLECTIONS_INDEX_URL = new URL(collectionsIndexFile ?? 'index.json', this.#COLLECTIONS_URL);
		this.#transformers = { ...(transformers ?? {}) };
	}

	get collectionsPath() {
		return this.#COLLECTIONS_URL.pathname;
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

	async #processImage({ assets, imageOptimizer, filePath, imagePath, altText }: ProcessImageParams) {
		const entryUrl = new URL(filePath, this.#COLLECTIONS_URL);
		const imagePrivateUrl = new URL(imagePath, entryUrl);
		let imageSrc = imagePrivateUrl.href;

		if (entryUrl.host === imagePrivateUrl.host) {
			imageSrc = await imageOptimizer.addImageToCache(assets, {
				src: imagePrivateUrl.pathname,
				widths: this.#imageSizes
			});
		}

		return imageOptimizer.getImageHtml(imageSrc, { altText, loading: 'lazy', decoding: 'async' });
	}

	async #newMarkdownParser(assets: Env['Assets'], imageOptimizer: ImageOptimizer, entryPath: string) {
		const marked = new Marked({
			async: true,
			breaks: true,
			gfm: true
		});

		const highlighter = await createHighlighter({
			langs: ['md', 'js', 'html', 'css', 'typescript', 'powershell', 'shell', 'fish', 'jsx'],
			themes: []
		});

		marked.use(markedFootnote());
		marked.use(markedShiki({
			highlight(code, lang, props) {
				return highlighter.codeToHtml(code, {
					lang,
					// TODO: configure themes and custom themes.
					themes: {
						light: 'light-plus',
						dark: 'dark-plus'
						// contrast: hcShikiTheme
					},
					// eslint-disable-next-line @typescript-eslint/naming-convention
					meta: { __raw: props.join(' ') },
					transformers: [
						// transformerTwoslash({
						// 	explicitTrigger: true,
						// 	rendererRich: { errorRendering: 'hover' }
						// }),
						transformerNotationDiff({ matchAlgorithm: 'v3' }),
						transformerNotationHighlight({ matchAlgorithm: 'v3' }),
						transformerNotationWordHighlight({ matchAlgorithm: 'v3' }),
						transformerNotationFocus({ matchAlgorithm: 'v3' }),
						transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
						transformerRenderWhitespace({ position: 'boundary' }),
						transformerMetaHighlight(),
						transformerMetaWordHighlight()
					]
				});
			}
		}));

		// TODO: add definition lists
		// TODO: add support for subscript
		// TODO: add support for superscript
		// TODO: add support for highlighting
		// TODO: add support for underline

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

				token.html = await this.#processImage({
					assets,
					imageOptimizer,
					filePath: entryPath,
					imagePath: token.href ?? '',
					altText: token.text
				});
			}
		});

		return marked;
	}

	async #parseMarkdown(assets: Env['Assets'], imageOptimizer: ImageOptimizer, entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: Record<string, any> | undefined;

		if (frontmatter) {
			metadata = parseYaml(frontmatter);
		}

		const marked = await this.#newMarkdownParser(assets, imageOptimizer, entryPath);

		return {
			metadata,
			contents: await marked.parse(markdown ?? '')
		};
	}

	async renderInlineMarkdown(assets: Env['Assets'], imageOptimizer: ImageOptimizer, text: string) {
		const marked = await this.#newMarkdownParser(assets, imageOptimizer, '');

		return marked.parseInline(text);
	}

	async renderMarkdown<T>(assets: Env['Assets'], imageOptimizer: ImageOptimizer, entryPath: string, text: string) {
		const [id] = (new URL(entryPath, this.#COLLECTIONS_URL).pathname.split('/').pop() ?? '').split('.');
		const { contents, metadata } = await this.#parseMarkdown(assets, imageOptimizer, entryPath, text);

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return {
			id,
			metadata,
			contents
		} as MarkdownEntry<T>;
	}

	async list<T>({ assets, templateRenderer, imageOptimizer, collectionName }: ListEntriesParams) {
		await this.#initCollections(assets);

		const collection = this.#collections[collectionName];

		if (!collection) {
			return {} satisfies Record<string, MarkdownEntry<T>>;
		}

		const results: Record<string, MarkdownEntry<T>> = {};

		for (const file of collection) {
			results[file] = await this.get<T>({
				assets,
				templateRenderer,
				imageOptimizer,
				collectionName,
				entry: file
			});
		}

		return results;
	}

	async get<T>({ assets, templateRenderer, imageOptimizer, collectionName, entry }: GetEntryParams) {
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
			let markdownEntry = await this.renderMarkdown<T>(assets, imageOptimizer, entryUrl.pathname, text);

			markdownEntry.contents = await templateRenderer.renderString({
				assets,
				imageOptimizer,
				text: markdownEntry.contents
			});

			if (this.#transformers[collectionName]) {
				markdownEntry = await this.#transformers[collectionName]({
					assets,
					entry: markdownEntry,
					markdownParser: await this.#newMarkdownParser(assets, imageOptimizer, entry),
					imageOptimizer
				});
			}

			this.#collectionsCache[entry] = markdownEntry;
		}

		return this.#collectionsCache[entry] as MarkdownEntry<T>;
	}
}
