/* eslint-disable max-lines, @typescript-eslint/no-explicit-any */

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
import { type Tokens, Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import markedShiki from 'marked-shiki';
import {
	type BundledLanguage,
	type BundledTheme,
	type LanguageInput,
	type SpecialLanguage,
	type SpecialTheme,
	type ThemeInput,
	type ThemeRegistration,
	createHighlighter,
	createJavaScriptRegexEngine
} from 'shiki';
import { parse as parseYaml } from 'yaml';
import type { ImageOptimizer } from './ImageOptimizer.ts';
import { basename } from './path.ts';
import type { Mode } from './StaticSiteHandler.ts';
import type { TemplateRenderer } from './TemplateRenderer.ts';

const jsRegexEngine = createJavaScriptRegexEngine();

export interface MarkdownEntry<T> {
	id: string;
	metadata?: T;
	contents: string;
}

export interface EntryTransformerParameters<T> {
	imageOptimizer: ImageOptimizer;
	templateRenderer: TemplateRenderer;
	markdownParser: Marked;
	entry: MarkdownEntry<T>;
	mode: Mode;
}

export type TransformerFunction<T, R> = (assets: Env['Assets'], options: EntryTransformerParameters<T>) => MarkdownEntry<R> | Promise<MarkdownEntry<R> | undefined> | undefined;

export type SortingFunction<T> = (entryA: [string, MarkdownEntry<T>], entryB: [string, MarkdownEntry<T>]) => number;

interface ShikiOptions {
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

		const highlighter = await createHighlighter({
			langs: this.#shikiOptions.langs,
			themes: Object.values(this.#shikiOptions.themes),
			engine: jsRegexEngine
		});

		marked.use(markedFootnote());
		marked.use(markedShiki({
			highlight: (code, lang, props) =>
				highlighter.codeToHtml(code, {
					lang,
					themes: Object.fromEntries(
						Object.entries(this.#shikiOptions.themes)
							.map(([themeName, theme]) => [themeName, ((theme as ThemeRegistration)?.name ?? theme) as string])
					),
					defaultColor: false,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					meta: { __raw: props.join(' ') },
					transformers: [
						transformerNotationDiff(),
						transformerNotationHighlight(),
						transformerNotationWordHighlight(),
						transformerNotationFocus(),
						transformerNotationErrorLevel(),
						transformerRenderWhitespace({ position: 'boundary' }),
						transformerMetaHighlight(),
						transformerMetaWordHighlight()
					]
				})
		}));

		interface SuperscriptToken extends Tokens.Generic {
			type: 'superscript';
			html: string;
			text: string;
		}

		marked.use({
			extensions: [{
				name: 'superscript',
				level: 'inline',
				start: (src) => src.indexOf('~'),
				tokenizer: (src) => {
					const rule = /\^(?!\^)(?<text>[^^]*?)\^(?!\^)/iu;
					const match = rule.exec(src);

					if (!match) {
						return;
					}

					return {
						type: 'superscript',
						raw: match[0],
						text: match.groups?.['text'],
						html: ''
					};
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: (token: SuperscriptToken) => {
				if (token.type !== 'superscript') {
					return;
				}

				token.html = `<sup>${token.text}</sup>`;
			}
		});

		interface SubscriptToken extends Tokens.Generic {
			type: 'subscript';
			html: string;
			text: string;
		}

		marked.use({
			extensions: [{
				name: 'subscript',
				level: 'inline',
				start: (src) => src.indexOf('~'),
				tokenizer: (src) => {
					const rule = /~(?!~)(?<text>[^~]*?)~(?!~)/iu;
					const match = rule.exec(src);

					if (!match) {
						return;
					}

					return {
						type: 'subscript',
						raw: match[0],
						text: match.groups?.['text'],
						html: ''
					};
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: (token: SubscriptToken) => {
				if (token.type !== 'subscript') {
					return;
				}

				token.html = `<sub>${token.text}</sub>`;
			}
		});

		interface InsertionToken extends Tokens.Generic {
			type: 'insertion';
			html: string;
			text: string;
		}

		marked.use({
			extensions: [{
				name: 'insertion',
				level: 'inline',
				start: (src) => src.indexOf('++'),
				tokenizer: (src) => {
					const rule = /\+\+(?<text>[^+]*?)\+\+/iu;
					const match = rule.exec(src);

					if (!match) {
						return;
					}

					return {
						type: 'insertion',
						raw: match[0],
						text: match.groups?.['text'],
						html: ''
					};
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: (token: InsertionToken) => {
				if (token.type !== 'insertion') {
					return;
				}

				token.html = `<ins>${token.text}</ins>`;
			}
		});

		interface HighlightToken extends Tokens.Generic {
			type: 'highlight';
			html: string;
			text: string;
		}

		marked.use({
			extensions: [{
				name: 'highlight',
				level: 'inline',
				start: (src) => src.indexOf('=='),
				tokenizer: (src) => {
					const rule = /[=]=(?<text>[^=]*?)==/iu;
					const match = rule.exec(src);

					if (!match) {
						return;
					}

					return {
						type: 'highlight',
						raw: match[0],
						text: match.groups?.['text'],
						html: ''
					};
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: (token: HighlightToken) => {
				if (token.type !== 'highlight') {
					return;
				}

				token.html = `<mark>${token.text}</mark>`;
			}
		});

		interface ImageToken extends Tokens.Generic {
			type: 'imageOptimization';
			html: string;
			text: string;
			href: string;
		}

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
						href: match.groups?.['href'] ?? '',
						text: match.groups?.['alt'] ?? '',
						html: ''
					} satisfies ImageToken;
				},
				renderer: (token: Tokens.Generic & { html?: string }) => token.html
			}],
			async: true,
			// @ts-expect-error
			walkTokens: async (token: ImageToken) => {
				if (token.type !== 'imageOptimization') {
					return;
				}

				token.html = await this.#processImage(assets, entryPath, token.href ?? '', token.text);
			}
		});

		return marked;
	}

	async #parseMarkdown(assets: Env['Assets'], entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: Record<string, any> | undefined;

		if (frontmatter) {
			metadata = parseYaml(frontmatter);
		}

		const marked = await this.#newMarkdownParser(assets, entryPath);

		return {
			metadata,
			contents: await marked.parse(markdown ?? '')
		};
	}

	async renderInlineMarkdown(assets: Env['Assets'], text: string) {
		const marked = await this.#newMarkdownParser(assets, '');

		return marked.parseInline(text);
	}

	async renderMarkdown<T>(assets: Env['Assets'], entryPath: string, text: string) {
		const id = basename(new URL(entryPath, this.#COLLECTIONS_URL).pathname, '.md');
		const { contents, metadata } = await this.#parseMarkdown(assets, entryPath, text);

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

	async get<T>(assets: Env['Assets'], collectionName: string, entry: string) {
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
				mode: this.mode
			});
		}

		return markdownEntry;
	}
}
