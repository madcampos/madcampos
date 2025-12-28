import type { APIRoute, GetStaticPathsResult } from 'astro';
import { listAllPosts } from '../../../../../utils/post.ts';

export const GET: APIRoute<Awaited<ReturnType<typeof listAllPosts>>[number]> = ({ props }) => {
	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' });
	const text = `${props.data.title}
${formatter.format(props.data.createdAt)}

---

${props.data.summary}

---

${props.body ?? ''}
`;

	return new Response(text, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=UTF-8'
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
