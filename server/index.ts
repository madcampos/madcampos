/// <reference path="./env.d.ts" />

export default {
	async fetch(request) {
		if (!new URL(request.url).pathname.startsWith('/api')) {
			return new Response('Get out, you are durnk!', { status: 410 });
		}

		return new Response('pong!', { status: 200 });
	}
} satisfies ExportedHandler<Env>;
