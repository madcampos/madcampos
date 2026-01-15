import type { APIRoute, GetStaticPaths, InferGetStaticPropsType, PaginateFunction } from 'astro';
import { getImage } from 'astro:assets';
import defaultImage from '../../assets/images/logo/logo-blog-micro.png';
import { escapeHtmlTags, inlineMarkdownStrip } from '../../utils/markdown.js';
import { listAllPosts, MAX_POSTS_PER_PAGE } from '../../utils/post.js';

// eslint-disable-next-line @typescript-eslint/no-use-before-define
type APIProps = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<APIProps> = async ({ props, site }) => {
	const blogImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(site!);

	baseUrl.protocol = 'https:';

	const blogUrl = new URL('/blog/', baseUrl).toString();
	const currentPageUrl = new URL(`./feed.atom${props.page.currentPage === 1 ? '' : props.page.currentPage}.xml`, blogUrl).toString();
	const nextPageUrl = props.page.currentPage < props.page.lastPage
		? new URL(`./feed.atom${props.page.currentPage + 1}.xml`, blogUrl).toString()
		: undefined;
	const prevPageUrl = props.page.currentPage > 1
		? new URL(`./feed.atom${props.page.currentPage - 1 === 1 ? '' : props.page.currentPage - 1}.xml`, blogUrl).toString()
		: undefined;

	const allPosts = await listAllPosts();
	const items = await Promise.all(allPosts.map(async (post) => {
		const image = await post.getImage();
		const imageTag = image ? `<img src="${new URL(image.src, baseUrl).toString()}" alt="${post.data.imageAlt ?? ''}" height="128" width="128" />` : '';

		const postTags = post.data.tags?.map((tag) => `<category>${tag}</category>`).join('\n') ?? '';

		return `<item>
			<guid>${new URL(post.url, blogUrl).toString()}</guid>
			<title>${escapeHtmlTags(inlineMarkdownStrip(post.data.title))}</title>
			<pubDate>${post.data.updatedAt ?? post.data.createdAt}</pubDate>
			<link>${new URL(post.url, blogUrl).toString()}</link>
			<description><![CDATA[
				${imageTag}
				<hr />
				<p>${inlineMarkdownStrip(post.data.summary)}</p>
				<hr />
				${await post.renderString()}
			]]></description>
			${postTags}
		</item>`;
	}));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
			<channel>
				<title>Marco Campos' Blog</title>
				<description>Marco Campos' Blog — A space where I talk about web development and other programming related (or not) things.</description>
				<link>${blogUrl}</link>
				<atom:link rel="self" type="application/atom+xml" href="${currentPageUrl}" />

				<atom:link rel="first" href="${new URL('./feed.atom.xml', blogUrl).toString()}" />
				${prevPageUrl ? `<atom:link rel="previous" href="${prevPageUrl}" />` : ''}
				${nextPageUrl ? `<atom:link rel="next" href="${nextPageUrl}" />` : ''}
				<atom:link rel="last" href="${new URL(`./feed.atom${props.page.lastPage}.xml`, blogUrl).toString()}" />

				<language>en-US</language>
				<pubDate>${new Date(allPosts[0]?.data.createdAt ?? new Date()).toUTCString()}</pubDate>
				<lastBuildDate>${new Date(allPosts[0]?.data.createdAt ?? new Date()).toUTCString()}</lastBuildDate>
				<generator>Astro</generator>
				<image>${escapeHtmlTags(new URL(blogImage.src, baseUrl).href)}</image>
				<managingEditor>me@madcampos.dev (Marco Campos)</managingEditor>
				${items.join('\n')}
			</channel>
		</rss>
	`;

	return new Response(atomFeed, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};

export const getStaticPaths = (async ({ paginate }: { paginate: PaginateFunction }) => {
	const postsList = await listAllPosts();

	return paginate(postsList, {
		pageSize: MAX_POSTS_PER_PAGE
	});
}) satisfies GetStaticPaths;
