/* eslint-disable @typescript-eslint/no-explicit-any */

import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

export interface MarkdownEntry<T> {
	id: string;
	metadata?: T;
	contents: string;
}

export class Collections {
	#COLLECTIONS_FOLDER = '_data';
	#COLLECTIONS_INDEX_FILE = 'index.json';
	#METADATA_IMAGE_PROPERTY = 'image';
	#METADATA_ASSETS_PATH = './assets';
	#ASSETS_PUBLIC_PATH = '_assets';
	#collections!: Record<string, string[]>;
	#collectionsCache: Record<string, MarkdownEntry<any>> = {};
	#assetPathMap: Record<string, string> = {};

	#marked: Marked;

	constructor() {
		this.#marked = new Marked({
			async: true,
			breaks: true,
			gfm: true
		});

		// TODO: add markdown plugins
	}

	async #initCollections(assets: Env['Assets']) {
		if (!this.#collections) {
			const response = await assets.fetch(`https://assets.local/${this.#COLLECTIONS_FOLDER}/${this.#COLLECTIONS_INDEX_FILE}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch collection index file at: ${this.#COLLECTIONS_FOLDER}/${this.#COLLECTIONS_INDEX_FILE}`);
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
		const newPublicPath = `${this.#ASSETS_PUBLIC_PATH}/${crypto.randomUUID()}${extension}`;

		this.#assetPathMap[newPublicPath] = assetPath;

		return newPublicPath;
	}

	async #renderMarkdown<T>(entryPath: string, text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		let metadata: T | undefined;
		const { groups: { id } = {} } = /\/(?<id>[^/]+?)\.[a-z0-9]+?$/isu.exec(entryPath) ?? {};

		if (frontmatter) {
			metadata = parseYaml(frontmatter) as T;

			// @ts-expect-error
			const imageProperty: string | undefined = metadata?.[this.#METADATA_IMAGE_PROPERTY];
			if (imageProperty?.startsWith(this.#METADATA_ASSETS_PATH)) {
				const entryFolder = entryPath.replace(/\/(.+?)$/iu, '');
				const imagePrivatePath = `${entryFolder}/${imageProperty.replace('./', '')}`;

				// @ts-expect-error
				metadata[this.#METADATA_IMAGE_PROPERTY] = this.#getAssetPublicPath(imagePrivatePath);
			}
		}

		const contents = await this.#marked.parse(markdown ?? '');

		// TODO: convert image paths

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
			const response = await assets.fetch(`https://assets.local/${this.#COLLECTIONS_FOLDER}/${entry}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch entry at: "${this.#COLLECTIONS_FOLDER}/${entry}"`);
			}

			const text = await response.text();
			const markdownEntry = await this.#renderMarkdown<T>(`${this.#COLLECTIONS_FOLDER}/${entry}`, text);

			this.#collectionsCache[entry] = markdownEntry;
		}

		return this.#collectionsCache[entry] as MarkdownEntry<T>;
	}

	async getAsset(assets: Env['Assets'], assetPath: string) {
		if (!assetPath.startsWith(this.#ASSETS_PUBLIC_PATH)) {
			throw new Error(`Asset path is not on public images folder: "${assetPath}"`);
		}

		const assetPrivatePath = this.#assetPathMap[assetPath];

		if (!assetPrivatePath) {
			throw new Error(`Asset does not exist: "${assetPath}"`);
		}

		return assets.fetch(`https://assets.local/${assetPrivatePath}`);
	}
}
