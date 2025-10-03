import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { icon } from '../public/_templates/components/Icon.ts';
import server from './index.ts';
import { sort as sortChangelogs, transform as transformChangelog } from './utils/changelog.ts';

import hcShikiTheme from './hc-shiki-theme.json' with { type: 'json' };

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	collections: {
		transformers: {
			changelog: transformChangelog
		},
		sorters: {
			changelog: sortChangelogs
		},
		shiki: {
			langs: ['md', 'js', 'html', 'css', 'typescript', 'powershell', 'shell', 'fish', 'jsx'],
			themes: {
				light: 'light-plus',
				dark: 'dark-plus',
				contrast: hcShikiTheme
			}
		}
	},
	templateRenderer: {
		components: {
			'm-icon': icon
		}
	},
	routes: {
		'/': { renderHtml: { template: 'index.html' } },
		'/404': { renderHtml: { template: '404.html' } },
		'/410': { renderHtml: { template: '410.html' } },
		'/about': { renderHtml: { template: 'about.html' } },
		'/accessibility': { renderHtml: { template: 'accessibility.html' } },
		'/bookmarks': { renderHtml: { template: 'bookmarks.html' } },
		'/changelog': {
			render: async (assets, { templateRenderer, url, collections }) => {
				const changelogs = await collections.list(assets, 'changelog');

				const body = await templateRenderer.renderTemplate(
					assets,
					'changelog.html',
					{ changelogs: Object.values(changelogs), url }
				);

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			}
		},
		'/ai': { renderHtml: { template: 'ai.html' } },
		'/food': { renderHtml: { template: 'food.html' } },
		'/license': { renderHtml: { template: 'license.html' } },
		'/now': { renderHtml: { template: 'now.html' } },
		'/offline': { renderHtml: { template: 'offline.html' } },
		'/privacy': { renderHtml: { template: 'privacy.html' } },
		'/sitemap': { renderHtml: { template: 'sitemap.html' } },
		'/styleguide': { renderHtml: { template: 'styleguide.html' } },
		'/todo': { renderHtml: { template: 'todo.html' } },
		'/triangle': { renderHtml: { template: 'triangle.html' } }
	},
	fallbackRoute: {
		render: async (assets, { templateRenderer }) => {
			const body = await templateRenderer.renderTemplate(assets, '404.html');

			return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html' } });
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
