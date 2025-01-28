import type { APIRoute, MarkdownInstance } from 'astro';

import rss, { type RSSFeedItem } from '@astrojs/rss';
import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';

import defaultImage from '../assets/images/logo/logo-micro.png';

export const GET: APIRoute = async (context) => {
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const ONE_WEEK_IN_MINUTES = 60 * 24 * 7;

	const siteImage = await getImage({ src: defaultImage, format: 'png', width: 512, height: 512 });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const baseUrl = new URL(context.site!);

	baseUrl.protocol = 'https:';

	const changelogFiles = import.meta.glob<MarkdownInstance<{}>>('../content/changelog/*.md', { eager: true });

	return rss({
		title: "Marco Campos' Site Changelog",
		description: "Changelog (Version History) for Marco Campos' Website, containing all recent changes.",
		site: baseUrl.toString(),
		items: (await Promise.all((await getCollection('changelog')).map(async (changelog) => {
			const versionNumber = changelog.id.replace('.md', '');
			const { versionName } = changelog.data;

			const [, changelogMarkdown] = Object.entries(changelogFiles).find(([filePath]) => filePath.includes(changelog.id)) ?? [];

			const item: RSSFeedItem = {
				title: `${versionNumber}${versionName ? ` (${versionName})` : ''}`,
				description: await changelogMarkdown?.compiledContent(),
				content: await changelogMarkdown?.compiledContent(),
				pubDate: changelog.data.date,
				link: new URL(`/changelog.xml#${versionNumber}`, baseUrl).toString()
			};

			return item;
		}))).sort(({ pubDate: prevPubDate = new Date() }, { pubDate: nextPubDate = new Date() }) => nextPubDate.getTime() - prevPubDate.getTime()),
		stylesheet: '/blog/feed.xsl',
		customData: `
		<language>en-us</language>
		<image>
			<url>${new URL(siteImage.src, baseUrl).toString()}</url>
			<title>Marco Campos' Website Changelog</title>
			<description>Changelog (Version History) for Marco Campos' Website, containing all recent changes.</description>
			<link>http://madcampos.dev/changelog.xml</link>
			<width>142</width>
			<height>116</height>
		</image>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		<ttl>${ONE_WEEK_IN_MINUTES}</ttl>
	`
	});
};
