import type { APIRoute, GetStaticPathsResult } from 'astro';
import { escapeHtmlTags, inlineMarkdownStrip } from '../../../../../utils/markdown.ts';
import { listAllPosts } from '../../../../../utils/post.ts';

export const GET: APIRoute<Awaited<ReturnType<typeof listAllPosts>>[number]> = async ({ props }) => {
	const text = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<oembed>
	<version>1.0</version>
	<type>rich</type>
	<provider_name>Marco Campos Blog</provider_name>
	<provider_url>https://madcampos.dev/</provider_url>
	<title>${escapeHtmlTags(inlineMarkdownStrip(props.data.title))}</title>
	<author_name>Marco Campos</author_name>
	<author_url>https://madcampos.dev/</author_url>
	<width>640</width>
	<height>480</height>
	${
		props.data.image
			? `
			<thumbnail_url>${escapeHtmlTags(props.data.image.src)}</thumbnail_url>
			<thumbnail_width>${props.data.image.width}</thumbnail_width>
			<thumbnail_height>${props.data.image.height}</thumbnail_height>
		`
			: ''
	}
	<html>${escapeHtmlTags(await props.renderString())}</html>
</oembed>
`;

	return new Response(text, {
		status: 200,
		headers: {
			'Content-Type': 'text/xml+oembed'
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
