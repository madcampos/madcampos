import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import defaultImage from '../../assets/images/logo/logo-blog-micro.png';
import { escapeHtmlTags, inlineMarkdownStrip } from '../../utils/markdown.js';
import { listAllPosts } from '../../utils/post.js';

// TODO: add pagination
// Ref: https://stackoverflow.com/questions/1301392/pagination-in-feeds-like-atom-and-rss
// Ref: https://kevincox.ca/2022/05/06/rss-feed-best-practices/

export const GET: APIRoute = async (context) => {
	const blogImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(context.site!);

	baseUrl.protocol = 'https:';

	const blogUrl = new URL('/blog/', baseUrl).toString();
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
			<title>${inlineMarkdownStrip(post.data.title)}</title>
			<updated>${post.data.updatedAt ?? post.data.createdAt}</updated>
			<published>${post.data.createdAt}</published>
			<link rel="alternate" type="text/html" href="${new URL(post.url, blogUrl).toString()}" />
			<summary>${inlineMarkdownStrip(post.data.summary)}</summary>
			<content type="html">${postContent}</content>
			${postTags}
		</entry>`;
	}));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Blog</title>
			<subtitle>Marco Campos' Blog — A space where I talk about web development and other programming related (or not) things.</subtitle>
			<id>${blogUrl}</id>
			<link rel="alternate" type="text/html" href="${blogUrl}" />
			<link rel="self" type="application/atom+xml" href="${feedUrl}" />
			<updated>${new Date(allPosts[0]?.data.createdAt ?? new Date()).toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${escapeHtmlTags(new URL(blogImage.src, baseUrl).href)}</logo>
			<icon>${escapeHtmlTags(new URL(blogImage.src, baseUrl).href)}</icon>
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
