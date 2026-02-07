import { Router } from './router.ts';
import { nonExistentPages } from './routes/410.ts';
import { getVisitorCount, incrementVisitorCount } from './routes/hit-counter.ts';
import { yapper } from './routes/yapper/index.ts';
import { simpleOptionsResponse } from './utils/index.ts';

const router = new Router({
	routes: {
		'GET /tojs-styleguide': nonExistentPages,
		'GET /tojs-styleguide/': nonExistentPages,
		'GET /blog/2023/06/07/tabs-web-component': nonExistentPages,
		'GET /blog/2023/06/07/tabs-web-component/': nonExistentPages,
		'GET /yapping': yapper,
		'GET /yapping/*': yapper,
		'OPTIONS /api/counter/': simpleOptionsResponse,
		'GET /api/counter/': getVisitorCount,
		'PUT /api/counter/': incrementVisitorCount
	}
});

export default router satisfies ExportedHandler<Env>;
