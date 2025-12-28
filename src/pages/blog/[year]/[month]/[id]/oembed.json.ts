/* eslint-disable camelcase */

import type { APIRoute, GetStaticPathsResult } from 'astro';
import { listAllPosts } from '../../../../../utils/post.ts';

export const GET: APIRoute<Awaited<ReturnType<typeof listAllPosts>>[number]> = async ({ props }) => {
	const json = {
		version: '1.0',
		type: 'rich',
		provider_name: 'Marco Campos Blog',
		provider_url: 'https://madcampos.dev/',
		title: props.data.title,
		author_name: 'Marco Campos',
		author_url: 'https://madcampos.dev/',
		width: 640,
		height: 480,
		...(props.data.image ?
			{
				thumbnail_url: props.data.image?.src,
				thumbnail_width: props.data.image.width,
				thumbnail_height: props.data.image.height
			} :
			undefined),
		html: await props.renderString()
	};

	return new Response(JSON.stringify(json), {
		status: 200,
		headers: {
			'Content-Type': 'application/json+oembed'
		}
	});
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	return (await listAllPosts()).map((post) => ({
		params: {
			year: post.year,
			month: post.month,
			day: post.day,
			id: post.id
		},
		props: post
	}));
}
