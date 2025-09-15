import { type RouteView, StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { TemplateRenderer } from '../lib/TemplateRenderer.ts';
import { icon } from '../src/templates/components/Icon.ts';
import server from './index.ts';

const BASE_URL = 'https://madcampos.dev/';

interface PageMetadata {
	title: string;
	description: string;
	pageSchema: string;
	url: string;
	styles?: string[];
	tags?: string;
	pageType?: 'article';
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

function renderHtml(template: string, metadata: PageMetadata) {
	return {
		render: async (assets) => {
			const body = await templateRenderer.renderTemplate(assets, template, { metadata });

			return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
		}
	} satisfies RouteView;
}

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': renderHtml('index.html', {
			// TODO: how can this static content be added directly to the html?
			title: 'Marco Campos — Senior Web Developer',
			description: 'Tech Stack: Vue.js, Node.js, TypeScript, JavaScript',
			pageSchema: 'ProfilePage',
			url: BASE_URL,
			styles: ['/css/pages/home.css']
		}),
		'/410': renderHtml('410.html', {
			title: 'Dead End | Marco Campos',
			description: 'Dead End',
			pageSchema: 'WebPage',
			url: `${BASE_URL}410`,
			styles: ['/css/pages/404.css']
		}),
		'/about': renderHtml('about.html', {
			title: 'About | Marco Campos',
			description: 'More about myself.',
			pageSchema: 'WebPage',
			url: `${BASE_URL}about/`
		}),
		'/accessibility': renderHtml('accessibility.html', {
			title: 'Accessibility Statement | Marco Campos',
			description: 'Accesibility Statement for Marco Campos website',
			pageSchema: 'WebPage',
			url: `${BASE_URL}accessibility/`
		}),
		'/ai': renderHtml('ai.html', {
			title: 'AI Use Statement | Marco Campos',
			description: 'AI Use Statement for Marco Campos website',
			pageSchema: 'WebPage',
			url: `${BASE_URL}ai/`
		}),
		'/food': renderHtml('food.html', {
			title: 'Food Order | Marco Campos',
			description: 'What food to order at different places',
			pageSchema: 'WebPage',
			url: `${BASE_URL}food/`
		}),
		'/offline': renderHtml('offline.html', {
			title: 'Offline | Marco Campos',
			description: 'Offline Page',
			pageSchema: 'WebPage',
			url: `${BASE_URL}offline/`,
			styles: ['/css/pages/404.css']
		}),
		'/triangle': renderHtml('triangle.html', {
			title: 'QuickRichClub | Marco Campos',
			description: 'Welcome to QuickRichClub',
			pageSchema: 'WebPage',
			url: `${BASE_URL}triangle/`,
			styles: ['/css/pages/triangle.css']
		})
	},
	fallbackRoute: {
		render: async (assets) => {
			const body = await templateRenderer.renderTemplate(assets, '404.html', {
				metadata: {
					title: '404 | Marco Campos',
					description: '404 — Not Found',
					pageSchema: 'WebPage',
					url: `${BASE_URL}404`,
					styles: ['/css/pages/404.css']
				} satisfies PageMetadata
			});

			return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
