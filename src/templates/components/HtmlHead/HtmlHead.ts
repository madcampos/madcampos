import { html } from '@lit-labs/ssr';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { BLOG, GLOBALS } from '../../utils/constants.ts';
import { join } from '../../utils/path.ts';

interface Props {
	htmlTitle?: string[];
	title: string;
	baseUrl: string;
	url: string;
	description: string;
	tags?: string[];
	image?: string;
	imageAlt?: string;
	createdAt?: Date;
	updatedAt?: Date;
	hasFeed?: boolean;
	styles?: string[];
}

export function htmlHead({
	htmlTitle,
	title,

	baseUrl,
	url,

	image,
	imageAlt,

	hasFeed,

	description,
	tags,

	createdAt,
	updatedAt,

	styles = []
}: Props) {
	const fullUrl = join([new URL(url, baseUrl).toString()], { trailingSlash: true });

	const socialImageAlt = imageAlt ?? 'The letter "m" on a monospaced font, in blue, between curly braces.';
	const socialImage = join([baseUrl, image ?? '/assets/images/social/social.png'], { trailingSlash: false });
	const feedUrl = when(hasFeed, () =>
		html`
			<link
				rel="alternate"
				type="application/atom+xml"
				href="${join([BLOG.url, 'feed.xml'], { trailingSlash: false })}"
				title="${BLOG.titleString}"
			/>
		`);

	const publishedDate = createdAt
		? html`
			<meta property="article:published_time" content="${createdAt.toISOString()}" />
			<meta name="publish_date" property="og:publish_date" content="${createdAt.toISOString()}" />
		`
		: '';

	const updatedDate = updatedAt
		? html`
			<meta property="article:modified_time" content="${updatedAt.toISOString()}" />
			<meta name="updated_date" property="og:updated_date" content="${updatedAt.toISOString()}" />
		`
		: '';

	return html`
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />

			<title>${htmlTitle?.join(' | ') ?? title}</title>

			<!-- URLs -->
			<link rel="canonical" href="${fullUrl}" />
			<link rel="author" href="${join([baseUrl, 'humans.txt'])}" />
			<link rel="sitemap" href="${join([GLOBALS.url, 'sitemap-index.xml'], { trailingSlash: false })}" />
			${feedUrl}

			<!-- App Metadata -->
			<link rel="icon" href="${join([GLOBALS.url, '/assets/icons/icon.svg'], { trailingSlash: false })}" sizes="any" type="image/svg+xml" />
			<link rel="icon" href="${join([GLOBALS.url, 'favicon.ico'], { trailingSlash: false })}" sizes="48x48" type="image/x-icon" />
			<link rel="manifest" href="/site.webmanifest" />
			<link rel="license" href="${join([GLOBALS.url, 'license'])}" />

			<!-- Social metadata -->
			<meta property="og:title" name="twitter:title" itemprop="name" content="${title}" />

			<meta property="og:type" content="${hasFeed ? 'article' : 'website'}" />
			<meta name="twitter:card" content="${socialImage ? 'summary_large_image' : 'summary'}" />

			<meta property="og:locale" itemprop="inLanguage" content="en_US" />
			<meta property="og:url" itemprop="url" content="${fullUrl}" />

			<meta property="og:description" name="description" itemprop="abstract" content="${description}" />
			<meta name="twitter:description" content="${description}" />

			<meta property="og:image" name="twitter:image" itemprop="image" content="${socialImage}" />
			<meta property="og:image:alt" name="twitter:image:alt" content="${socialImageAlt}" />

			<meta property="article:author" name="author" content="Marco Campos" />
			<meta name="twitter:creator" content="@madcampos" />

			<meta name="twitter:dnt" content="on" />
			<meta name="twitter:widgets:csp" content="on" />
			<meta name="twitter:widgets:autoload" content="off" />
			<meta name="twitter:widgets:theme" content="dark" />

			${tags ? html`<meta name="keywords" itemprop="keywords" property="article:tag" content="${tags.join(', ')}" />` : ''}

			${publishedDate}
			${updatedDate}

			<!-- Webmention -->
			<link rel="webmention" href="https://webmention.io/madcampos.dev/webmention" />
			<link rel="pingback" href="https://webmention.io/madcampos.dev/xmlrpc" />

			<!-- Changelog -->
			<link rel="alternate" type="application/atom+xml" href="${join([GLOBALS.url, 'changelog.xml'], { trailingSlash: false })}" title="Changelog (Version History)" />

			<!-- Apple icons -->
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

			<!-- Main css -->
			<link rel="stylesheet" href="/css/index.css" />

			<!-- Page CSS -->
			${map(styles, (style) => html`<link rel="stylesheet" href="${style}" />`)}

			<!-- Print Stylesheet -->
			<link rel="stylesheet" type="text/css" href="/css/print.css" media="print" />

			<!-- Prefetch speculation rules -->
			<script type="speculationrules">
				{
					"prefetch": [{
						"where": { "and": [{ "selector_matches": "a" }, {"href_matches": "/*" }] },
						"eagerness": "moderate",
						"requires": ["anonymous-client-ip-when-cross-origin"]
					}]
				}
			</script>
			<script src="/js/index.mjs" type="module"></script>
		</head>
	`;
}
