import { Router } from './router.ts';
import { nonExistentPages } from './routes/410.ts';
import { yapper } from './routes/yapper/index.ts';

const router = new Router({
	routes: {
		'/tojs-styleguide': nonExistentPages,
		'/tojs-styleguide/': nonExistentPages,
		'/blog/2023/06/07/tabs-web-component': nonExistentPages,
		'/blog/2023/06/07/tabs-web-component/': nonExistentPages,
		'/yapping/*': yapper
	}
});

export default router satisfies ExportedHandler<Env>;
