import type { APIRoute, GetStaticPaths, InferGetStaticPropsType, PaginateFunction } from 'astro';
import { encodeEmail } from '../../utils/email.js';
import { escapeHtmlTags, inlineMarkdownStrip } from '../../utils/markdown.js';
import { listAllPosts, MAX_POSTS_PER_PAGE } from '../../utils/post.js';

export const getStaticPaths = (async ({ paginate }: { paginate: PaginateFunction }) => {
	const postsList = await listAllPosts();

	return paginate(postsList, {
		pageSize: MAX_POSTS_PER_PAGE
	});
}) satisfies GetStaticPaths;

type APIProps = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<APIProps> = async ({ props, site }) => {
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

	const items = await Promise.all(props.page.data.map(async (post) => {
		const image = await post.getImage();
		const imageTag = image ? `<img src="${new URL(image.src, baseUrl).toString()}" alt="${post.data.imageAlt ?? ''}" height="128" width="128" />` : '';

		const postTags = post.data.tags?.map((tag) => `<category term="${tag}" />`).join('\n') ?? '';

		return `<entry>
			<id>${new URL(post.url, blogUrl).toString()}</id>
			<title>${escapeHtmlTags(inlineMarkdownStrip(post.data.title))}</title>
			<updated>${post.data.updatedAt ?? post.data.createdAt}</updated>
			<published>${post.data.createdAt}</published>
			<link rel="alternate" type="text/html" href="${new URL(post.url, blogUrl).toString()}" />
			<summary><![CDATA[${inlineMarkdownStrip(post.data.summary)}]]></summary>
			<content type="html"><![CDATA[
				${imageTag}
				${await post.renderString()}
			]]></content>
			${postTags}
		</entry>`;
	}));

	const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US">
			<title>Marco Campos' Blog</title>
			<subtitle>Marco Campos' Blog — A space where I talk about web development and other programming related (or not) things.</subtitle>
			<id>${blogUrl}</id>
			<link rel="alternate" type="text/html" href="${blogUrl}" />
			<link rel="self" type="application/atom+xml" href="${currentPageUrl}" />

			<link rel="first" href="${new URL('./feed.atom.xml', blogUrl).toString()}" />
			${prevPageUrl ? `<link rel="previous" href="${prevPageUrl}" />` : ''}
			${nextPageUrl ? `<link rel="next" href="${nextPageUrl}" />` : ''}
			<link rel="last" href="${new URL(`./feed.atom${props.page.lastPage}.xml`, blogUrl).toString()}" />

			<updated>${new Date().toISOString()}</updated>
			<generator uri="https://astro.build/">Astro</generator>
			<logo>${escapeHtmlTags(new URL('/assets/images/logo-blog-micro.png', baseUrl).href)}</logo>
			<icon>${escapeHtmlTags(new URL('/assets/images/logo-blog-micro.png', baseUrl).href)}</icon>
			<author>
				<name>Marco Campos</name>
				<email>${encodeEmail(true)}</email>
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
