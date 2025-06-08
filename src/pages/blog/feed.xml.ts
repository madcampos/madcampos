import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';

import { BLOG } from '../../constants.js';
import { escapeHtmlTags, inlineMarkdownRender } from '../../utils/markdown.js';
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
	const items = await Promise.all(allPosts.map(async (post) => {
		const image = await post.getImage();
		const imageTag = image ? `<img src="${new URL(image.src, baseUrl).toString()}" alt="${post.data.imageAlt ?? ''}" height="128" width="128" />` : '';

		const postContent = escapeHtmlTags(`
			${imageTag}
			${await post.renderString()}
		`);

		const postTags = post.data.tags?.map((tag) => `<category term="${tag}" />`).join('\n') ?? '';

		return `<entry>
			<id>${new URL(post.url, blogUrl).toString()}</id>
			<title>${escapeHtmlTags(post.data.title)}</title>
			<updated>${post.data.updatedAt ?? post.data.createdAt}</updated>
			<published>${post.data.createdAt}</published>
			<link rel="alternate" type="text/html" href="${new URL(post.url, blogUrl).toString()}" />
			<summary type="html">${inlineMarkdownRender(post.data.summary)}</summary>
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
			<logo>${escapeHtmlTags(new URL(blogImage.src, baseUrl).toString())}</logo>
			<icon>${escapeHtmlTags(new URL(blogImage.src, baseUrl).toString())}</icon>
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
