import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

export interface MarkdownEntry<T> {
	metadata?: T;
	contents: string;
}

export class Collections {
	#COLLECTIONS_FOLDER = '_data';
	#collections: Record<string, string[]> = {};

	#marked: Marked;

	constructor(collections: Record<string, string[]>) {
		Object.entries(collections).forEach(([collection, files]) => {
			this.#collections[collection] = files;
		});

		this.#marked = new Marked({
			async: true,
			breaks: true,
			gfm: true
		});

		// TODO: add markdown plugins
	}

	async #renderMarkdown<T>(text: string) {
		const { groups: { frontmatter, markdown } = {} } = /(?:^---\n(?<frontmatter>.*?)\n---\n)?(?<markdown>.*$)/isu.exec(text) ?? {};
		const contents = await this.#marked.parse(markdown ?? '');
		let metadata;

		if (frontmatter) {
			metadata = parseYaml(frontmatter) satisfies T;
		}

		return {
			metadata,
			contents
		} satisfies MarkdownEntry<T>;
	}

	async list<T>(assets: Env['Assets'], collectionName: string) {
		const collection = this.#collections[collectionName];

		if (!collection) {
			return [] as T[];
		}

		const results: Record<string, MarkdownEntry<T>> = {};

		for (const file of collection) {
			results[file] = await this.get<T>(assets, collectionName, file);
		}

		return results;
	}

	async get<T>(assets: Env['Assets'], collectionName: string, entry: string) {
		const response = await assets.fetch(`https://assets.local/${this.#COLLECTIONS_FOLDER}/${collectionName}/${entry}`);
		const text = await response.text();

		return this.#renderMarkdown<T>(text);
	}
}
