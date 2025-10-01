/// <reference types="urlpattern-polyfill" />

import { type CollectionsOptions, Collections } from './CollectionsProcessing.ts';
import { type ImageOptimizerOptions, ImageOptimizer } from './ImageOptimizer.ts';
import { type TemplateRendererOptions, TemplateRenderer } from './TemplateRenderer.ts';

interface FileSystemModule {
	writeFile(path: string, data: Uint8Array | string): Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	mkdir(path: string, options?: { recursive?: boolean }): Promise<string | void>;
	cp(src: string, dest: string, options?: { force?: boolean, recursive?: boolean }): Promise<void>;
	glob(pattern: string): AsyncIterable<string>;
}

interface RouterViewResolverParams {
	assets: Env['Assets'];
	collections: Collections;
	templateRenderer: TemplateRenderer;
	imageOpttimizer: ImageOptimizer;
	url: URLPattern;
}

interface BaseRouteView {
	resolveParams?(params: RouterViewResolverParams): Promise<string[]> | string[];
}

interface RouterViewParams {
	assets: Env['Assets'];
	collections: Collections;
	templateRenderer: TemplateRenderer;
	imageOptimizer: ImageOptimizer;
	path: string;
	url: string;
	params?: URLPatternResult;
	data?: unknown;
}

interface GenericRenderRouteView extends BaseRouteView {
	render(params: RouterViewParams): Promise<Response> | Response;
	renderHtml?: never;
}

interface HtmlRenderRouteView extends BaseRouteView {
	render?: never;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	renderHtml: { template: string, data?: any };
}

export type RouteView = GenericRenderRouteView | HtmlRenderRouteView;

interface StaticSiteHandlerOptions {
	baseUrl: URL | string;
	routes: Record<string, RouteView>;
	fallbackRoute?: RouteView;
	trailingSlash?: 'always' | 'ignore' | 'never';
	fetchHandler?: ExportedHandlerFetchHandler;
	imageOptimizer?: ImageOptimizerOptions;
	collections?: CollectionsOptions;
	templateRenderer?: TemplateRendererOptions;
}

export class StaticSiteHandler {
	#BASE_URL: URL;
	#PATH_WITH_EXT_REGEX = /\/([^/]+?)\.[a-z0-9]+?$/iu;
	#TRAILING_SLASHES_REGEX = /\/$/iu;
	#FORBIDDEN_CHARS_IN_FILES_REGEX = /[\\<>:"|?*]/giu;
	#routes: [URLPattern, GenericRenderRouteView][] = [];
	#resolvedRoutes = new Map<URLPattern, string[]>();
	#fallbackRoute: GenericRenderRouteView;
	#fetchHandler?: ExportedHandlerFetchHandler;
	#templateRenderer: TemplateRenderer;
	#imageOptimizer: ImageOptimizer;
	#collections: Collections;

	constructor({ routes, baseUrl, fallbackRoute, trailingSlash, fetchHandler, templateRenderer, collections, imageOptimizer }: StaticSiteHandlerOptions) {
		this.#BASE_URL = new URL(baseUrl);

		this.#fetchHandler = fetchHandler;
		this.#templateRenderer = new TemplateRenderer(templateRenderer);
		this.#collections = new Collections(collections);
		this.#imageOptimizer = new ImageOptimizer(imageOptimizer);

		const normalizedFallbackRoute: GenericRenderRouteView = {
			resolveParams: fallbackRoute?.resolveParams,
			render: fallbackRoute?.render ?? (() => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } }))
		};

		if (fallbackRoute?.renderHtml) {
			normalizedFallbackRoute.render = async ({ assets, url }) => {
				const body = await this.#templateRenderer.renderTemplate({
					assets,
					imageOptimizer: this.#imageOptimizer,
					template: fallbackRoute.renderHtml.template,
					data: { ...(fallbackRoute.renderHtml.data ?? {}), url }
				});

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			};
		}

		this.#fallbackRoute = normalizedFallbackRoute;

		this.#routes.push([new URLPattern(`${this.#templateRenderer.templatesPath}{/}?*`, this.#BASE_URL.href), normalizedFallbackRoute]);
		this.#routes.push([new URLPattern(`/${this.#collections.collectionsPath}{/}?*`, this.#BASE_URL.href), normalizedFallbackRoute]);

		this.#routes.push([new URLPattern(`/${this.#imageOptimizer.publicAssetsPath}{/}?*`, this.#BASE_URL.href), {
			render: async ({ assets, path }) => this.#imageOptimizer.fetchImage(assets, path)
		}]);

		Object.entries(routes).forEach(([path, route]) => {
			let resolvedPath = path;

			switch (trailingSlash) {
				case 'always':
					resolvedPath = path.replace(new RegExp(this.#TRAILING_SLASHES_REGEX, 'ui'), '');
					resolvedPath = resolvedPath.replace(new RegExp(this.#PATH_WITH_EXT_REGEX, 'ui'), '/$1');
					resolvedPath = `${resolvedPath}/`;
					break;
				case 'never':
					resolvedPath = path.replace(new RegExp(this.#TRAILING_SLASHES_REGEX, 'ui'), '');
					break;
				case 'ignore':
				case undefined:
				default: {
					const pathWithoutTrailingSlash = path.replace(new RegExp(this.#TRAILING_SLASHES_REGEX, 'ui'), '');

					if (!new RegExp(this.#PATH_WITH_EXT_REGEX, 'ui').test(pathWithoutTrailingSlash)) {
						resolvedPath = `${pathWithoutTrailingSlash}{/}?`;
					}
					break;
				}
			}

			this.#routes.push([new URLPattern(resolvedPath, this.#BASE_URL.href), {
				resolveParams: route.resolveParams,
				render: route.render ?? (async ({ assets, url }) => {
					const body = await this.#templateRenderer.renderTemplate({
						assets,
						imageOptimizer: this.#imageOptimizer,
						template: route.renderHtml.template,
						data: { ...(route.renderHtml.data ?? {}), url }
					});

					return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
				})
			}]);
		});
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

	async #resolveRoute(assets: Env['Assets'], url: string) {
		const resolvedUrl = new URL(url, this.#BASE_URL);
		const [pattern, route] = this.#routes.find(([curPattern]) => curPattern.test(resolvedUrl.pathname, this.#BASE_URL.href)) ?? [];

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
				resolvedRoutes = await route.resolveParams({
					assets,
					collections: this.#collections,
					imageOpttimizer: this.#imageOptimizer,
					templateRenderer: this.#templateRenderer,
					url: pattern
				});

				this.#resolvedRoutes.set(pattern, resolvedRoutes);
			}

			const resolvedPath = resolvedRoutes.find((path) => path === resolvedUrl.pathname);

			if (resolvedPath) {
				try {
					return await route.render({
						assets,
						collections: this.#collections,
						imageOptimizer: this.#imageOptimizer,
						templateRenderer: this.#templateRenderer,
						path: resolvedPath,
						url
					});
				} catch (err) {
					console.error(`Error rendering route: ${url}.`);
					console.error(err);
				}
			}
		}

		return route.render({
			assets,
			collections: this.#collections,
			imageOptimizer: this.#imageOptimizer,
			templateRenderer: this.#templateRenderer,
			path: resolvedUrl.pathname,
			url
		});
	}

	async build(assets: Env['Assets'], fileSystemModule: FileSystemModule, outputPath: string, publicDir: string) {
		await fileSystemModule.mkdir(outputPath, { recursive: true });

		for await (const entry of fileSystemModule.glob(`${publicDir}/**/*`)) {
			if (entry.startsWith(`${publicDir}${this.#templateRenderer.templatesPath}`) || entry.startsWith(`${publicDir}${this.#collections.collectionsPath}`)) {
				continue;
			}

			await fileSystemModule.cp(publicDir, outputPath, { force: true, recursive: true });
		}

		for (const [pattern, route] of this.#routes) {
			const resolvedRoutes: string[] = [];

			if (route.resolveParams) {
				resolvedRoutes.push(
					...await route.resolveParams({
						assets,
						collections: this.#collections,
						imageOpttimizer: this.#imageOptimizer,
						templateRenderer: this.#templateRenderer,
						url: pattern
					})
				);
			} else if (pattern.pathname === '/*') {
				resolvedRoutes.push('/404.html');
			} else {
				resolvedRoutes.push(
					pattern.pathname
						.replace(/\{\/\}\?$/iu, '')
						.replaceAll(
							new RegExp(this.#FORBIDDEN_CHARS_IN_FILES_REGEX, 'uig'),
							(char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
						)
				);
			}

			for (const resolvedPath of resolvedRoutes) {
				try {
					const response = await route.render({
						assets,
						collections: this.#collections,
						imageOptimizer: this.#imageOptimizer,
						templateRenderer: this.#templateRenderer,
						path: resolvedPath,
						url: new URL(resolvedPath, this.#BASE_URL).href
					});

					const file = await (await response.blob()).bytes();
					let filePath = resolvedPath;

					if (filePath.endsWith('/')) {
						filePath += 'index.html';
					}

					if (!new RegExp(this.#PATH_WITH_EXT_REGEX, 'ui').test(filePath)) {
						filePath += '.html';
					}

					const resolvedFilePath = `${outputPath}${filePath}`.replace(/\/+/giu, '/');
					const resolvedFolder = resolvedFilePath.split('/').slice(0, -1).join('/');

					await fileSystemModule.mkdir(resolvedFolder, { recursive: true });
					await fileSystemModule.writeFile(resolvedFilePath, file);
				} catch (err) {
					console.error(`Error writing file for route: ${resolvedPath}.`);
					console.error(err);
				}
			}
		}
	}

	async fetch<CfHostMetadata = unknown>(request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, context: ExecutionContext) {
		const resolvedResponse = await this.#resolveRoute(env.Assets, request.url);

		if (resolvedResponse) {
			return resolvedResponse;
		}

		if (this.#fetchHandler) {
			const handlerResponse = await this.#fetchHandler(request, env, context);

			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			if (handlerResponse.status !== 404) {
				return handlerResponse;
			}
		}

		return this.#fallbackRoute.render({
			assets: env.Assets,
			collections: this.#collections,
			imageOptimizer: this.#imageOptimizer,
			templateRenderer: this.#templateRenderer,
			path: new URL(request.url).pathname,
			url: request.url
		});
	}
}
