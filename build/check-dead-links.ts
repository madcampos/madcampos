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
	isDead: boolean;
	originalUrl: string;
	archivedUrl?: string;
	sourceFile: string;
}

interface CachedLiveLink {
	isDead: false;
	sourceFile: string;
}

interface CachedDeadLink {
	isDead: true;
	archiveUrl?: string;
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
const linksCache = new Map<string, CachedLiveLink | CachedDeadLink>();

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

async function resolveLink(url: string, sourceFile: string) {
	const cachedLink = linksCache.get(url);

	if (cachedLink) {
		return cachedLink;
	}

	try {
		const headResponse = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' }, LINK_TIMEOUT_MS);
		const isHeadHealthy = headResponse.ok && headResponse.status < 400;

		if (isHeadHealthy) {
			const healthLink: CachedLiveLink = { isDead: false, sourceFile };

			linksCache.set(url, healthLink);

			return healthLink;
		}

		// INFO: retry with a get request
		if ([403, 405, 429].includes(headResponse.status)) {
			const getResponse = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' }, LINK_TIMEOUT_MS);
			const linkStatus: CachedDeadLink | CachedLiveLink = {
				isDead: getResponse.ok && getResponse.status < 400,
				sourceFile
			};

			linksCache.set(url, linkStatus);

			return linkStatus;
		}

		const archiveResponse = await fetchWithTimeout(
			`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
			{ method: 'GET', redirect: 'follow' },
			ARCHIVE_TIMEOUT_MS
		);

		if (!archiveResponse.ok) {
			const deadLink: CachedDeadLink = { isDead: true, sourceFile };
			linksCache.set(url, deadLink);

			return deadLink;
		}

		const payload: WaybackResponse = await archiveResponse.json();
		const archiveUrl = payload.archived_snapshots?.closest?.url;

		const archivedLink: CachedDeadLink = { isDead: true, archiveUrl, sourceFile };
		linksCache.set(url, archivedLink);

		return archivedLink;
	} catch {
		const deadLink: CachedDeadLink = { isDead: true, sourceFile };
		linksCache.set(url, deadLink);

		return deadLink;
	}
}
try {
	const existingLinks = await fs.readFile(options.output, 'utf8');
	const savedFile: DeadLink[] = JSON.parse(existingLinks);

	for (const deadLink of savedFile) {
		linksCache.set(deadLink.originalUrl, {
			isDead: deadLink.isDead,
			archiveUrl: deadLink.archivedUrl,
			sourceFile: deadLink.sourceFile
		});
	}
} catch {
	// NOOP
}

const htmlFiles: string[] = [];

const entries = await fs.readdir(options.source, { withFileTypes: true });
while (entries.length > 0) {
	// oxlint-disable-next-line typescript/no-non-null-assertion
	const entry = entries.pop()!;
	const fullPath = path.join(options.source, entry.name);

	if (entry.isDirectory()) {
		entries.push(...await fs.readdir(options.source, { withFileTypes: true }));
		continue;
	}

	if (entry.isFile() && entry.name.endsWith('.html')) {
		htmlFiles.push(fullPath);
	}
}

const deadLinks: DeadLink[] = [];
for (const file of htmlFiles) {
	const source = await fs.readFile(file, 'utf8');
	const hrefPattern = /href\s*=\s*(['"])(https?:\/\/[^'"\s]+)\1/giu;
	const matches = [...source.matchAll(hrefPattern)];

	if (matches.length === 0) {
		continue;
	}

	for (const match of matches) {
		const originalUrl = match[2];
		if (!originalUrl || !isAllowedUrl(originalUrl)) {
			continue;
		}

		const resolvedLink = await resolveLink(originalUrl, file);

		deadLinks.push({
			isDead: resolvedLink.isDead,
			originalUrl,
			archivedUrl: resolvedLink.isDead ? resolvedLink.archiveUrl : undefined,
			sourceFile: file
		});
	}
}

try {
	const deadLinksText = JSON.stringify(deadLinks, null, '\t');
	await writeFile(options.output, deadLinksText, { encoding: 'utf8' });

	// oxlint-disable-next-line no-console
	console.log(`${styleText('cyanBright', '[dead-link-check]')} Dead links list saved to: ${options.output}`);
	process.exit(0);
} catch (err) {
	console.error(err);

	process.exit(1);
}
