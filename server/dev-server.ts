import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';
import server from './index.ts';

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	routes: {},
	fetchHandler: server.fetch
});

export default app;
