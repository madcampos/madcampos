import type { APIRoute, MarkdownInstance } from 'astro';
import { getImage } from 'astro:assets';

import { BLOG } from '../../constants.js';
import { listAllPosts } from '../../utils/post.js';

import defaultImage from '../../assets/images/logo/logo-blog-micro.png';

// TODO: add pagination
// Ref: https://stackoverflow.com/questions/1301392/pagination-in-feeds-like-atom-and-rss
// Ref: https://kevincox.ca/2022/05/06/rss-feed-best-practices/

export const GET: APIRoute = async (context) => {
	const blogImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(context.site!);

	baseUrl.protocol = 'https:';

	const blogUrl = new URL(BLOG.url, baseUrl).toString();
	const feedUrl = new URL('./feed.xml', blogUrl).toString();

	const allPosts = await listAllPosts();
	const postFiles = import.meta.glob<MarkdownInstance<{}>>('../../content/blog/**/*.md', { eager: true });
	const items = await Promise.all(allPosts.map(async (post) => {
		const image = post.data.image ? await getImage({ src: post.data.image, format: 'png' }) : undefined;
		const imageTag = image ? `<img src="${new URL(image.src, baseUrl).toString()}" alt="${post.data.imageAlt ?? ''}" height="128" width="128" />` : '';

		const [, postMarkdown] = Object.entries(postFiles).find(([filePath]) => filePath.includes(post.url)) ?? [];
		const compiledMarkdown = await postMarkdown?.compiledContent() ?? '';

		const postContent = `
			${imageTag}
			${compiledMarkdown}
		`.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

		const postTags = post.data.tags?.map((tag) => `<category term="${tag}" />`).join('\n') ?? '';

		return `<entry>
			<id>${new URL(post.url, blogUrl).toString()}</id>
			<title>${post.data.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title>
			<updated>${post.data.updatedAt ?? post.data.createdAt}</updated>
			<published>${post.data.createdAt}</published>
			<link rel="alternate" type="text/html" href="${new URL(post.url, blogUrl).toString()}" />
			<summary>${post.data.summary.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</summary>
			<content type="html">${postContent}</content>
			${postTags}
		</entry>`;
	}));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<?xml-stylesheet type="text/xsl" href="${new URL('feed.xsl', new URL(BLOG.url, baseUrl).toString()).toString()}"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Blog</title>
			<subtitle>${BLOG.description}</subtitle>
			<id>${blogUrl}</id>
			<link rel="alternate" type="text/html" href="${blogUrl}" />
			<link rel="self" type="application/atom+xml" href="${feedUrl}" />
			<updated>${new Date(allPosts[0]?.data.createdAt ?? new Date()).toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${new URL(blogImage.src, baseUrl).toString().replaceAll('&', '&amp;')}</logo>
			<icon>${new URL(blogImage.src, baseUrl).toString().replaceAll('&', '&amp;')}</icon>
			<author>
				<name>Marco Campos</name>
				<email>me@madcampos.dev</email>
				<uri>https://madcampos.dev/</uri>
			</author>
			${items.join('\n')}
		</feed>
	`;

	return new Response(atomFeed, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
