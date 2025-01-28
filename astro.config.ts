import { readFileSync } from 'node:fs';

import sitemap from '@astrojs/sitemap';
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
import { transformerTwoslash } from '@shikijs/twoslash';
import astroPWA, { type PwaOptions } from '@vite-pwa/astro';
import astroIcon from 'astro-icon';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBehead from 'remark-behead';
import remarkBreaks from 'remark-breaks';
import remarkDirective from 'remark-directive';

import { assetsCache, externalResourcesCache, pagesCache, scriptsCache } from './src/sw-caching.js';
import { baselineInfo, codepenEmbed, youtubeEmbed } from './src/utils/markdown.js';

import hcShikiTheme from './src/assets/css/hc-shiki-theme.json' with { type: 'json' };

const manifest: PwaOptions['manifest'] = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf8' }));

const mode = process.env['NODE_ENV'] === 'production' ? 'production' : 'development';
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const siteUrl = process.env['SITE_URL'] || 'https://madcampos.dev/';

export default defineConfig({
	site: siteUrl,
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
	...(mode !== 'production' && {
		vite: {
			server: {
				https: {
					cert: './certs/server.crt',
					key: './certs/server.key'
				}
			}
		}
	}),
	markdown: {
		syntaxHighlight: 'shiki',
		shikiConfig: {
			theme: 'css-variables',
			themes: {
				light: 'light-plus',
				dark: 'dark-plus',
				// @ts-ignore - Astro is fussy about custom theme
				contrast: hcShikiTheme
			},
			defaultColor: false,
			wrap: true,
			transformers: [
				transformerTwoslash({
					explicitTrigger: true,
					rendererRich: { errorRendering: 'hover' }
				}),
				transformerNotationDiff({ matchAlgorithm: 'v3' }),
				transformerNotationHighlight({ matchAlgorithm: 'v3' }),
				transformerNotationWordHighlight({ matchAlgorithm: 'v3' }),
				transformerNotationFocus({ matchAlgorithm: 'v3' }),
				transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
				transformerRenderWhitespace({ position: 'boundary' }),
				transformerMetaHighlight(),
				transformerMetaWordHighlight()
			]
		},
		remarkPlugins: [[remarkBehead, { minDepth: 2 }], remarkBreaks, remarkDirective, youtubeEmbed, codepenEmbed, baselineInfo],
		rehypePlugins: [[rehypeExternalLinks, { rel: ['external', 'noopener', 'noreferrer'] }]]
	},
	integrations: [
		astroPWA({
			registerType: 'prompt',
			experimental: { directoryAndTrailingSlashHandler: true },
			minify: true,
			showMaximumFileSizeToCacheInBytesWarning: true,
			includeAssets: ['/icons/icon.svg', '/offline/index.html'],
			manifest,
			workbox: {
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				maximumFileSizeToCacheInBytes: 1024 * 128,
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				globIgnores: ['**/blog/**/**'],
				navigateFallback: '/offline/index.html',
				navigateFallbackDenylist: [/\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/iu, /\/blog\//iu],
				directoryIndex: 'index.html',
				runtimeCaching: [
					externalResourcesCache,
					assetsCache,
					scriptsCache,
					pagesCache
				],
				disableDevLogs: false
			},
			devOptions: {
				enabled: false
			},
			selfDestroying: false
		}),
		sitemap({
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date()
		}),
		astroIcon({
			iconDir: 'src/assets/icons'
		})
	]
});
