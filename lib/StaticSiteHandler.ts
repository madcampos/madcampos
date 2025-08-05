/// <reference types="urlpattern-polyfill" />

if (!('URLPattern' in globalThis)) {
	await import('urlpattern-polyfill');
}

import { html } from 'lit';

type HTMLRenderingFunction = typeof html;

interface FileSystemModule {
	writeFile(path: string, data: string | Uint8Array): Promise<void>;
	mkdir(path: string, options?: { recursive?: boolean }): Promise<void | string>;
	cp(src: string, dest: string, options?: { force?: boolean, recursive?: boolean }): Promise<void>;
}

interface MarkdownEntry<T> {
	metadata: T;
	render(): Promise<string> | string;
}

interface DataCollection {
	list: <T>() => Promise<MarkdownEntry<T>[]> | MarkdownEntry<T>[];
	get: <T>(key: string) => Promise<MarkdownEntry<T>> | MarkdownEntry<T>;
}

interface ResolvedRoute {
	path: string;
	params?: URLPatternResult;
	data?: unknown;
}

interface ResolveRouteParams {
	url: URLPattern;
	collections: Record<string, DataCollection>;
}

interface RenderParams extends ResolvedRoute {
	html: HTMLRenderingFunction;
	collections: Record<string, DataCollection>;
}

interface RouteView {
	resolveParams?: (params: ResolveRouteParams) => Promise<ResolvedRoute[]> | ResolvedRoute[];
	render: (params: RenderParams) => Promise<Response> | Response;
}

interface StaticSiteHandlerOptions {
	baseUrl: string;
	routes: Record<string, RouteView>;
	fallbackRoute?: RouteView;
	collections?: Record<string, DataCollection>;
	trailingSlash?: 'ignore' | 'always' | 'never';
	fetchHandler?: ExportedHandlerFetchHandler;
}

const RESTRICTED_CHARS_IN_FILES = /[\\<>:"|?*]/giu;

export class StaticSiteHandler {
	#pathWithExtensionRegex = /\/([^\/.]+?)\.[a-z0-9]+?$/iu;
	#trailingSlashRegex = /\/$/;

	#baseUrl: string;
	#collections: Record<string, DataCollection> = {};
	#routes: [URLPattern, RouteView][] = [];
	#resolvedRoutes = new Map<URLPattern, ResolvedRoute[]>();
	#fallbackRoute: RouteView = {
		render: () => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
	};
	#fetchHandler?: ExportedHandlerFetchHandler;

	constructor({ collections, routes, baseUrl, fallbackRoute, trailingSlash, fetchHandler }: StaticSiteHandlerOptions) {
		if (collections) {
			this.#collections = collections;
		}

		this.#baseUrl = baseUrl;
		this.#fetchHandler = fetchHandler;

		Object.entries(routes).forEach(([path, route]) => {
			let resolvedPath = path;

			switch (trailingSlash) {
				case 'always':
					resolvedPath = path.replace(new RegExp(this.#trailingSlashRegex), '');
					resolvedPath = resolvedPath.replace(new RegExp(this.#pathWithExtensionRegex), '/$1');
					resolvedPath = `${resolvedPath}/`;
					break;
				case 'never':
					resolvedPath = path.replace(new RegExp(this.#trailingSlashRegex), '');
					break;
				case 'ignore':
				default:
					const pathWithoutTrailingSlash = path.replace(new RegExp(this.#trailingSlashRegex), '');

					if (!new RegExp(this.#pathWithExtensionRegex).test(pathWithoutTrailingSlash)) {
						resolvedPath = `${pathWithoutTrailingSlash}{/}?`;
					}
					break;
			}

			this.#routes.push([new URLPattern(resolvedPath, this.#baseUrl), route]);
		});

		this.#routes.push([new URLPattern('*', this.#baseUrl), fallbackRoute ?? this.#fallbackRoute]);
	}

	#isPatternDynamic(pattern: URLPattern, url: string) {
		if (pattern?.hasRegExpGroups) {
			return true;
		}

		return Object.entries(pattern.exec(url) ?? {}).reduce((hasGroups, [key, value]) => {
			if (key !== 'inputs') {
				return Object.keys((value as URLPatternComponentResult).groups).length !== 0;
			}

			return hasGroups;
		}, false);
	}

	async #resolveRoute(url: string) {
		const resolvedUrl = new URL(url, this.#baseUrl);
		const [pattern, route] = this.#routes.find(([pattern]) => pattern.test(resolvedUrl.pathname, this.#baseUrl)) ?? [];

		if (!pattern || !route) {
			return;
		}

		if (this.#isPatternDynamic(pattern, url) && !route.resolveParams) {
			console.error(`Dynamic route for url "${url}" does not provide "resolveParams" function.`);
			return;
		}

		if (route?.resolveParams) {
			let resolvedRoutes = this.#resolvedRoutes.get(pattern);

			if (!resolvedRoutes) {
				resolvedRoutes = await route.resolveParams({ url: pattern, collections: this.#collections });

				this.#resolvedRoutes.set(pattern, resolvedRoutes);
			}

			const resolvedRoute = resolvedRoutes.find(({ path }) => path === resolvedUrl.pathname);

			if (resolvedRoute) {
				try {
					return route.render({
						collections: this.#collections,
						html,
						...resolvedRoute
					});
				} catch (err) {
					console.error(`Error rendering route: ${url}.`);
					console.error(err);
				}
			}
		}

		return route.render({
			collections: this.#collections,
			html,
			path: resolvedUrl.pathname
		});
	}

	async build(fileSystemModule: FileSystemModule, outputPath: string, publicDir: string) {
		await fileSystemModule.cp(publicDir, outputPath, { force: true, recursive: true });

		await fileSystemModule.mkdir(outputPath, { recursive: true });

		for (const [pattern, route] of this.#routes) {
			const resolvedRoutes: ResolvedRoute[] = [];

			if (route.resolveParams) {
				resolvedRoutes.push(...await route.resolveParams({ url: pattern, collections: this.#collections }));
			} else if (pattern.pathname === '/*') {
				resolvedRoutes.push({ path: '/404.html' });
			} else {
				resolvedRoutes.push({
					path: pattern.pathname
						.replace(/\{\/\}\?$/iu, '')
						.replaceAll(
							new RegExp(RESTRICTED_CHARS_IN_FILES),
							(char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
						)
				});
			}

			for (const resolvedRoute of resolvedRoutes) {
				try {
					const response = await route.render({
						collections: this.#collections,
						html,
						...resolvedRoute
					});

					const file = await (await response.blob()).bytes();
					let filePath = resolvedRoute.path;

					if (filePath.endsWith('/')) {
						filePath += 'index.html';
					}

					if (!new RegExp(this.#pathWithExtensionRegex).test(filePath)) {
						filePath += '.html';
					}

					const resolvedPath = `${outputPath}${filePath}`.replace(/\/+/giu, '/');
					const resolvedFolder = resolvedPath.split('/').slice(0, -1).join('/');

					await fileSystemModule.mkdir(resolvedFolder, { recursive: true });
					await fileSystemModule.writeFile(resolvedPath, file);
				} catch (err) {
					console.error(`Error writing file for route: ${resolvedRoute.path}.`);
					console.error(err);
				}
			}
		}
	}

	async fetch<CfHostMetadata = unknown>(request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, context: ExecutionContext) {
		const resolvedResponse = await this.#resolveRoute(request.url);

		if (resolvedResponse) {
			return resolvedResponse;
		}

		if (this.#fetchHandler) {
			const handlerResponse = await this.#fetchHandler(request, env, context);

			if (handlerResponse) {
				return handlerResponse;
			}
		}

		return this.#fallbackRoute.render({
			collections: this.#collections,
			path: new URL(request.url).pathname,
			html
		});
	}
}
