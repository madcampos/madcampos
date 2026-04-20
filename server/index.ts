import { Router } from './router.ts';
import { getVisitorCount, incrementVisitorCount } from './routes/hit-counter.ts';
import { simpleOptionsResponse } from './utils/index.ts';

const router = new Router({
	routes: {
		'OPTIONS /api/counter/': simpleOptionsResponse,
		'GET /api/counter/': getVisitorCount,
		'PUT /api/counter/': incrementVisitorCount
	}
});

export default router satisfies ExportedHandler<Env>;
