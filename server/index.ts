/// <reference path="./env.d.ts" />

export default {
	async fetch(request, env, ctx) {
		return new Response('pong!', { status: 200 });
	}
} satisfies ExportedHandler<Env>;
