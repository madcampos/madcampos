// TODO: output the text in activity pub format

import type { APIRoute, GetStaticPathsResult } from 'astro';

export const GET: APIRoute = () =>
	new Response('{}', {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});

export function getStaticPaths(): GetStaticPathsResult {
	return [];
}
