#!/usr/bin/env node

// oxlint-disable no-magic-numbers no-await-in-loop
// @ts-expect-error - Types are not found
import { showHelp } from '@mad-c/config';
import { promises as fs } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, styleText } from 'node:util';

// #region Config
const config = {
	output: {
		type: 'string',
		short: 'o',
		help: {
			message: 'The file to output the list of dead links.',
			value: 'file'
		},
		required: true
	},
	source: {
		type: 'string',
		short: 's',
		help: {
			message: 'The source folder to search for dead links.',
			value: 'dir'
		},
		required: true
	},
	help: {
		type: 'boolean',
		short: 'h',
		default: false,
		help: {
			message: 'Display this help message.'
		}
	}
} as const;
// #endregion

// #region Arg validation
const { values: options } = parseArgs({ options: config });

if (options.help) {
	showHelp('check-dead-links', 'Checks for dead links in a folder of html files.', config);
}

if (!options.output) {
	console.error('Missing required argument: --output');
	process.exit(1);
}

if (!options.source) {
	console.error('Missing required argument: --source');
	process.exit(1);
}
// #endregion

interface WaybackResponse {
	archived_snapshots?: {
		closest?: {
			available?: boolean,
			timestamp?: string,
			url?: string
		}
	};
}

interface DeadLink {
	originalUrl: string;
	archivedUrl?: string;
	sourceFile: string;
}

const DOMAIN_BLOCKLIST = [
	// Local/Own domains
	'localhost',
	'17.0.0.1',
	'madcampos.dev',

	// Archive.org domains
	'archive.org',
	'web.archive.org',

	// False positives
	'linkedin.com',
	'github.com',
	'codepen.io',
	'npmjs.com'
];

const LINK_TIMEOUT_MS = 10 * 1000;
const ARCHIVE_TIMEOUT_MS = 15 * 1000;
const USER_AGENT = 'madcampos-dead-link-checker/1.0 (+https://madcampos.dev/)';
const linkCache = new Map<string, boolean>();
const archiveCache = new Map<string, string | undefined>();

function isAllowedUrl(url: string) {
	try {
		const parsed = new URL(url);

		if (!['http:', 'https:'].includes(parsed.protocol)) {
			return false;
		}

		return !DOMAIN_BLOCKLIST.includes(parsed.hostname);
	} catch {
		return false;
	}
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, {
			...init,
			signal: controller.signal,
			headers: {
				'User-Agent': USER_AGENT,
				// oxlint-disable-next-line typescript/no-misused-spread
				...init.headers
			}
		});
	} finally {
		clearTimeout(timeout);
	}
}

async function isDeadLink(url: string) {
	if (linkCache.has(url)) {
		// oxlint-disable-next-line typescript/no-non-null-assertion
		return linkCache.get(url)!;
	}

	try {
		const headResponse = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' }, LINK_TIMEOUT_MS);
		const isHeadHealthy = headResponse.ok && headResponse.status < 400;

		if (isHeadHealthy) {
			linkCache.set(url, false);

			return false;
		}

		if ([403, 405, 429].includes(headResponse.status)) {
			const getResponse = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, LINK_TIMEOUT_MS);
			const isLive = getResponse.ok && getResponse.status < 400;

			linkCache.set(url, !isLive);

			return !isLive;
		}

		linkCache.set(url, true);

		return true;
	} catch {
		linkCache.set(url, true);

		return true;
	}
}

async function getLatestArchiveUrl(url: string) {
	if (archiveCache.has(url)) {
		return archiveCache.get(url);
	}

	try {
		const response = await fetchWithTimeout(
			`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
			{ method: 'GET', redirect: 'follow' },
			ARCHIVE_TIMEOUT_MS
		);

		if (!response.ok) {
			archiveCache.set(url, undefined);

			return undefined;
		}

		const payload: WaybackResponse = await response.json();
		const archiveUrl = payload.archived_snapshots?.closest?.url;

		archiveCache.set(url, archiveUrl);

		return archiveUrl ?? undefined;
	} catch {
		archiveCache.set(url, undefined);

		return undefined;
	}
}

async function findDeadLinksInHtml(html: string, filePath: string) {
	const hrefPattern = /href\s*=\s*(['"])(https?:\/\/[^'"\s]+)\1/giu;
	const matches = [...html.matchAll(hrefPattern)];

	if (matches.length === 0) {
		return [];
	}

	const links: DeadLink[] = [];
	for (const match of matches) {
		const originalUrl = match[2];
		if (!originalUrl || !isAllowedUrl(originalUrl)) {
			continue;
		}

		if (!(await isDeadLink(originalUrl))) {
			continue;
		}

		const archivedUrl = await getLatestArchiveUrl(originalUrl);

		links.push({
			originalUrl,
			archivedUrl,
			sourceFile: filePath
		});
	}

	return links;
}

async function findHtmlFiles(directory: string): Promise<string[]> {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...await findHtmlFiles(fullPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.html')) {
			files.push(fullPath);
		}
	}

	return files;
}

const htmlFiles = await findHtmlFiles(options.source);

const deadLinks: DeadLink[] = [];
for (const file of htmlFiles) {
	const source = await fs.readFile(file, 'utf8');

	deadLinks.push(...await findDeadLinksInHtml(source, file));
}

try {
	const deadLinksText = JSON.stringify(deadLinks, null, '\t');
	await writeFile(options.output, deadLinksText, { encoding: 'utf8' });

	console.log(`${styleText('cyanBright', '[dead-link-check]')} Dead links list saved to: ${options.output}`);
	process.exit(0);
} catch (err) {
	console.error(err);

	process.exit(1);
}
