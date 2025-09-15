import { type RouteView, StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { TemplateRenderer } from '../lib/TemplateRenderer.ts';
import { icon } from '../src/templates/components/Icon.ts';
import server from './index.ts';

interface PageMetadata {
	title?: string;
	description?: string;
	socialImage?: string;
	socialImageAlt?: string;
	createdAt?: string;
	updatedAt?: string;
}

const templateRenderer = new TemplateRenderer({
	components: {
		'css-naked-day': 'components/css-naked-day.html',
		'iab-escape': 'components/iab-escape.html',
		'svg-effects': 'components/svg-effects.html',
		'm-icon': icon,
		'm-logo': 'components/logo.html',
		'old-style-buttons': 'components/old-style-buttons.html',
		'm-webrings': 'components/m-webrings.html',
		'theme-switcher': 'components/theme-switcher.html',
		'site-nav': 'components/site-nav.html'
	}
});

function renderHtml(template: string, metadata?: PageMetadata) {
	return {
		render: async (assets, { url }) => {
			const body = await templateRenderer.renderTemplate(assets, template, { metadata: metadata ?? {}, url });

			return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
		}
	} satisfies RouteView;
}

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': renderHtml('index.html'),
		'/410': renderHtml('410.html'),
		'/about': renderHtml('about.html'),
		'/accessibility': renderHtml('accessibility.html'),
		'/ai': renderHtml('ai.html'),
		'/food': renderHtml('food.html'),
		'/offline': renderHtml('offline.html'),
		'/triangle': renderHtml('triangle.html')
	},
	fallbackRoute: {
		render: async (assets) => {
			const body = await templateRenderer.renderTemplate(assets, '404.html');

			return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html' } });
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
