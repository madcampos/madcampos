import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import server from './index.ts';

const BASE_URL = 'https://madcampos.dev/';

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': StaticSiteHandler.renderHtmlTemplate('index.liquid', {
			title: 'Marco Campos | Senior Web Developer',
			url: BASE_URL,
			styles: ['/css/pages/home.css']
		})
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
