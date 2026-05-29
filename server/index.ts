import { Router } from './router.ts';
import { getMessages } from './routes/guestbook.ts';
import { getVisitorCount, incrementVisitorCount } from './routes/hit-counter.ts';
import { simpleOptionsResponse } from './utils/index.ts';

const router = new Router({
	routes: {
		'OPTIONS /api/counter/': simpleOptionsResponse,
		'GET /api/counter/': getVisitorCount,
		'PUT /api/counter/': incrementVisitorCount,

		'OPTIONS /api/guestbook/': simpleOptionsResponse,
		'OPTIONS /api/guestbook/:page?': simpleOptionsResponse,
		'GET /api/guestbook/': getMessages,
		'GET /api/guestbook/:page?': getMessages
	}
});

export default router satisfies ExportedHandler<Env>;
