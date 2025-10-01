import { Collections } from '../lib/CollectionsProcessing.ts';
import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { icon } from '../public/_templates/components/Icon.ts';
import server from './index.ts';
import { listAllChangelogs } from './utils/changelog.ts';

const collections = new Collections();

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	collections: {
		transformers: {
			// TODO: add transformers
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
			render: async ({ assets, imageOptimizer, templateRenderer, url }) => {
				const changelogs = await listAllChangelogs(assets, collections, true);

				const body = await templateRenderer.renderTemplate({
					assets,
					imageOptimizer,
					template: 'changelog.html',
					data: { changelogs: Object.values(changelogs), url }
				});

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
		render: async ({ assets, imageOptimizer, templateRenderer }) => {
			const body = await templateRenderer.renderTemplate({
				assets,
				imageOptimizer,
				template: '404.html'
			});

			return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html' } });
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
