import { readFileSync } from 'node:fs';

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import astroPWA, { type PwaOptions } from '@vite-pwa/astro';

import remarkBreaks from 'remark-breaks';

const manifest: PwaOptions['manifest'] = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf8' }));

export default defineConfig({
	site: 'https://madcampos.dev/',
	base: '/',
	trailingSlash: 'ignore',
	devToolbar: { enabled: false },
	compressHTML: true,
	build: {
		format: 'directory'
	},
	server: {
		host: 'localhost',
		port: 3000
	},
	markdown: {
		shikiConfig: {
			theme: 'dark-plus'
		},
		remarkPlugins: [remarkBreaks]
	},
	integrations: [
		astroPWA({
			registerType: 'prompt',
			minify: true,
			includeAssets: ['/icons/favicon.svg'],
			manifest,
			scope: 'https://madcampos.dev/',
			// FIXME: Remove service worker on the base site, until we find a better alternative for sub-apps.
			injectRegister: null,
			devOptions: {
				enabled: false
			}
		}),
		sitemap({
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date()
		})
	]
});
