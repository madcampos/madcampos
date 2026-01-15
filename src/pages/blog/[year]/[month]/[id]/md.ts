import type { APIRoute, GetStaticPathsResult } from 'astro';
import { listAllPosts } from '../../../../../utils/post.js';

export const GET: APIRoute<Awaited<ReturnType<typeof listAllPosts>>[number]> = ({ props: { data, body } }) => {
	const text = `---
title: ${data.title}
summary: ${data.summary}${
		data.image
			? `\nimage: ${data.image.src}`
			: ''
	}${
		data.imageAlt
			? `\nimageAlt: ${data.imageAlt}`
			: ''
	}${
		data.imageRights
			? `\nimageRights: ${data.imageRights}`
			: ''
	}
createdAt: ${data.createdAt}${
		data.updatedAt
			? `\nupdatedAt: ${data.updatedAt}`
			: ''
	}${
		data.updates
			? `\nupdates:${data.updates.map((update) => `\n  - date: ${update.date}\n    changes: ${update.changes}`).join('')}`
			: ''
	}${
		data.draft
			? '\ndraft: true'
			: ''
	}
tags:${
		data.tags
			? data.tags.map((tag) => `\n  - ${tag}`).join('')
			: ''
	}
relatedPosts:${
		data.relatedPosts
			? data.relatedPosts.map((post) => `\n  - ${post}`).join('')
			: ''
	}
---

${body ?? ''}
`;

	return new Response(text, {
		status: 200,
		headers: {
			'Content-Type': 'text/markdown; charset=UTF-8; variant=GFM'
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
