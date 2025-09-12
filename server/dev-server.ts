import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import { TemplateRenderer } from '../lib/TemplateRenderer.ts';
import { icon } from '../src/templates/components/Icon.ts';
import server from './index.ts';

const BASE_URL = 'https://madcampos.dev/';

interface PageMetadata {
	title: string;
	description: string;
	tags?: string;
	pageSchema: string;
	url: string;
	styles: string[];
	pageType: 'article' | 'website';
	socialImage: string;
	socialImageAlt: string;
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
		'old-style-buttons': 'components/old-style-buttons.html'
	}
});

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': {
			render: async (assets) => {
				const body = await templateRenderer.renderTemplate(assets, 'index.html', {
					metadata: {
						title: 'Marco Campos — Senior Web Developer',
						description: 'Tech Stack: Vue.js, Node.js, TypeScript, JavaScript',
						tags: [
							'Senior web developer',
							'web developer',
							'vue.js',
							'vue',
							'node.js',
							'javascript',
							'typescript',
							'webdev'
						].join(),
						pageSchema: 'ProfilePage',
						pageType: 'website',
						socialImage: `${BASE_URL}assets/images/social/social.png`,
						socialImageAlt: 'The letter "m" on a monospaced font, in blue, between curly braces.',
						url: BASE_URL,
						styles: ['/css/pages/home.css']
					} satisfies PageMetadata
				});

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			}
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
