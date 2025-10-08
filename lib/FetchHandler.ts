/// <reference types="node" />

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export async function platformFetch(url: URL, readFile?: typeof import('node:fs/promises').readFile) {
	if (!readFile) {
		const workers = await import('cloudflare:workers');

		return workers.env.Assets.fetch(url);
	}

	return fetch(url);
}
