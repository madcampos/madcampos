import { StaticSiteHandler } from '../lib/StaticSiteHandler.ts';

import { sort as sortAuthors, transform as transformAuthors } from './data/authors.ts';
import { sort as sortChangelogs, transform as transformChangelog } from './data/changelog.ts';
import { sort as sortPosts, transform as transformPosts } from './data/post.ts';
import { sort as sortProjects, transform as transformProjects } from './data/projects.ts';
import { sort as sortTalks, transform as transformTalks } from './data/talks.ts';
import hcShikiTheme from './hc-shiki-theme.json' with { type: 'json' };

import { icon } from '../public/_templates/components/Icon.ts';

import { render as renderChangelogsXml } from '../public/_templates/changelog.xml.ts';

import server from './index.ts';

const app = new StaticSiteHandler({
	baseUrl: 'http://localhost:4242/',
	collections: {
		transformers: {
			authors: transformAuthors,
			changelog: transformChangelog,
			projects: transformProjects,
			talks: transformTalks,
			blog: transformPosts
		},
		sorters: {
			authors: sortAuthors,
			changelog: sortChangelogs,
			projects: sortProjects,
			talks: sortTalks,
			blog: sortPosts
		},
		shiki: {
			langs: ['md', 'js', 'html', 'css', 'typescript', 'powershell', 'shell', 'fish', 'jsx'],
			themes: {
				light: 'light-plus',
				dark: 'dark-plus',
				contrast: hcShikiTheme
			}
		}
	},
	templateRenderer: {
		components: {
			'm-icon': icon
		}
	},
	routes: {
		'/': { renderHtml: { template: 'index.html' } },
		'/404': { renderHtml: { template: '404.html' } },
		'/410': { renderHtml: { template: '410.html' } },
		'/about': { renderHtml: { template: 'about.html' } },
		'/accessibility': { renderHtml: { template: 'accessibility.html' } },
		'/bookmarks': { renderHtml: { template: 'bookmarks.html' } },
		'/changelog': {
			render: async ({ templateRenderer, url, collections }) => {
				const changelogs = await collections.list('changelog');

				const body = await templateRenderer.renderTemplate(
					'changelog.html',
					{ changelogs: Object.values(changelogs), url }
				);

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			}
		},
		'/changelog.xml': { render: renderChangelogsXml },
		'/ai': { renderHtml: { template: 'ai.html' } },
		'/food': { renderHtml: { template: 'food.html' } },
		'/license': { renderHtml: { template: 'license.html' } },
		'/now': { renderHtml: { template: 'now.html' } },
		'/offline': { renderHtml: { template: 'offline.html' } },
		'/privacy': { renderHtml: { template: 'privacy.html' } },
		'/sitemap': { renderHtml: { template: 'sitemap.html' } },
		'/styleguide': { renderHtml: { template: 'styleguide.html' } },
		'/todo': { renderHtml: { template: 'todo.html' } },
		'/triangle': { renderHtml: { template: 'triangle.html' } },
		'/projects': {
			render: async ({ templateRenderer, url, collections }) => {
				const projects = await collections.list('projects');

				const body = await templateRenderer.renderTemplate(
					'projects.html',
					{
						projects: Object.values(projects).map(({ metadata, contents }) => ({
							...(metadata ?? {}),
							contents
						})),
						url
					}
				);

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			}
		}
	},
	fallbackRoute: {
		render: async ({ templateRenderer }) => {
			const body = await templateRenderer.renderTemplate('404.html');

			return new Response(body, { status: 404, headers: { 'Content-Type': 'text/html' } });
		}
	},
	fetchHandler: server.fetch
});

export default app satisfies ExportedHandler<Env>;
