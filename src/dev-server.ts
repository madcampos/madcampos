import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import './components/index.ts';
import server from './index.ts';

import homePage from './pages/index.ts';

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {
		'/': homePage
	},
	fetchHandler: server.fetch
});

export default app;
