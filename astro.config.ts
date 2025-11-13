import { rehypeHeadingIds } from '@astrojs/markdown-remark';
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
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
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
		rehypePlugins: [
			rehypeHeadingIds,
			[rehypeAutolinkHeadings, { behavior: 'wrap' }],
			[rehypeExternalLinks, {
				rel: ['external', 'noopener', 'noreferrer'],
				referrerpolicy: 'no-referrer',
				contentProperties: { 'data-external-link': '' },
				content: [
					{
						type: 'element',
						tagName: 'sr-only',
						properties: {},
						children: [{ type: 'text', value: '(External link)' }]
					},
					{
						type: 'element',
						tagName: 'sup',
						properties: {},
						children: [{
							type: 'element',
							tagName: 'svg',
							properties: {
								'aria-hidden': 'true',
								'role': 'presentation',
								'viewBox': '0 0 24 24',
								'width': '24',
								'height': '24'
							},
							children: [{
								type: 'element',
								tagName: 'use',
								properties: { href: '#mingcute--external-link-line' },
								children: []
							}]
						}]
					}
				]
			}]
		],
		remarkRehype: {
			allowDangerousHtml: true,
			clobberPrefix: '',
			footnoteBackContent: (referenceIndex, rereferenceIndex) => {
				if (rereferenceIndex <= 1) {
					return [
						{
							type: 'element',
							tagName: 'sr-only',
							properties: {},
							children: [{ type: 'text', value: `Back to reference ${referenceIndex + 1}` }]
						},
						{
							type: 'element',
							tagName: 'sup',
							properties: {},
							children: [{
								type: 'element',
								tagName: 'svg',
								properties: {
									'aria-hidden': 'true',
									'role': 'presentation',
									'viewBox': '0 0 24 24',
									'width': '24',
									'height': '24'
								},
								children: [{
									type: 'element',
									tagName: 'use',
									properties: { href: '#mingcute--arrow-to-up-line' },
									children: []
								}]
							}]
						}
					];
				}

				return [{
					type: 'element',
					tagName: 'sr-only',
					properties: {},
					children: [{ type: 'text', value: `Back to reference ${referenceIndex + 1}` }]
				}, {
					type: 'element',
					tagName: 'sup',
					properties: {},
					children: [{ type: 'text', value: String.fromCharCode(95 + rereferenceIndex) }]
				}];
			},
			footnoteBackLabel: () => '',
			footnoteLabel: 'Footnotes',
			footnoteLabelProperties: {},
			footnoteLabelTagName: 'h2'
		}
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
