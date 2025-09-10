import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { TemplateRenderer } from '../lib/TemplateRenderer.ts';
import server from './index.ts';

const BASE_URL = 'https://madcampos.dev/';

const templateRenderer = new TemplateRenderer();

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': {
			render: async (assets) => {
				const body = await templateRenderer.renderTemplate(assets, 'index.html', {});

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			}
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
