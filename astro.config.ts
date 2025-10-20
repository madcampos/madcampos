import sitemap from '@astrojs/sitemap';
import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
	transformerRemoveNotationEscape,
	transformerRenderWhitespace
} from '@shikijs/transformers';
import { transformerTwoslash } from '@shikijs/twoslash';
import astroIcon from 'astro-icon';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';
import remarkHighlight from 'remark-flexible-markers';
import remarkIns from 'remark-ins';
import hcShikiTheme from './src/assets/css/hc-shiki-theme.json' with { type: 'json' };

const mode = process.env['NODE_ENV'] === 'production' ? 'production' : 'development';

export default defineConfig({
	output: 'static',
	site: 'https://madcampos.dev/',
	base: '/',
	redirects: mode !== 'production'
		? { '/api/': 'https://localhost:4242/api/' }
		: {},
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
				transformerRemoveNotationEscape(),
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
		remarkPlugins: [
			remarkBreaks,
			remarkIns,
			[remarkHighlight, { markerClassName: () => [''], markerProperties: (color?: string) => ({ 'data-color': color ?? 'default' }) }]
		],
		rehypePlugins: [[rehypeExternalLinks, { rel: ['external', 'noopener', 'noreferrer'], referrerpolicy: 'no-referrer' }]]
	},
	integrations: [
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
