/// <reference types="urlpattern-polyfill" />

import { dirname, extname, join } from '@std/path/posix';
import { type CollectionsOptions, Collections } from './CollectionsProcessing.ts';
import { type ImageOptimizerOptions, ImageOptimizer } from './ImageOptimizer.ts';
import { type TemplateRendererOptions, TemplateRenderer } from './TemplateRenderer.ts';

export type Mode = 'development' | 'production';

export interface FileSystemModule {
	writeFile(path: string, data: Uint8Array | string): Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	mkdir(path: string, options?: { recursive?: boolean }): Promise<string | void>;
	cp(src: string, dest: string, options?: { force?: boolean, recursive?: boolean }): Promise<void>;
	glob(pattern: string): AsyncIterable<string>;
}

export interface RouterViewResolverParams {
	collections: Collections;
	templateRenderer: TemplateRenderer;
	imageOpttimizer: ImageOptimizer;
	url: URLPattern;
}

export type ResolveParamsFunction = (params: RouterViewResolverParams) => Promise<string[]> | string[];

interface BaseRouteView {
	resolveParams?: ResolveParamsFunction;
}

export interface RouterViewParams {
	/**
	 * An instance of {@link Collections}.
	 */
	collections: Collections;

	/**
	 * An instance of {@link TemplateRenderer}.
	 */
	templateRenderer: TemplateRenderer;

	/**
	 * An instance of {@link ImageOptimizer}.
	 */
	imageOptimizer: ImageOptimizer;

	/**
	 * The full URL for the route.
	 */
	url: URL;

	/**
	 * If this is a dynamic URL, the resolved `URLPatternResults`.
	 */
	params?: URLPatternResult;
}

export type RenderFunction = (params: RouterViewParams) => Promise<Response> | Response;

interface GenericRenderRouteView extends BaseRouteView {
	render: RenderFunction;
	renderHtml?: never;
}

interface HtmlRenderRouteView extends BaseRouteView {
	render?: never;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	renderHtml: { template: string, data?: any };
}

export type RouteView = GenericRenderRouteView | HtmlRenderRouteView;

interface StaticSiteHandlerOptions {
	mode?: Mode;
	baseUrl: URL | string;
	routes: Record<string, RouteView>;
	fallbackRoute?: RouteView;
	trailingSlash?: 'always' | 'ignore' | 'never';
	fetchHandler?: ExportedHandlerFetchHandler;
	imageOptimizer?: ImageOptimizerOptions;
	collections?: Omit<CollectionsOptions, 'imageOptimizer' | 'templateRenderer'>;
	templateRenderer?: Omit<TemplateRendererOptions, 'imageOptimizer'>;
}

export class StaticSiteHandler {
	#BASE_URL: URL;
	#FORBIDDEN_CHARS_IN_FILES_REGEX = /[\\<>:"|?*]/giu;
	#routes: [URLPattern, GenericRenderRouteView][] = [];
	#resolvedRoutes = new Map<URLPattern, string[]>();
	#fallbackRoute: GenericRenderRouteView;
	#fetchHandler?: ExportedHandlerFetchHandler;
	#templateRenderer: TemplateRenderer;
	#imageOptimizer: ImageOptimizer;
	#collections: Collections;

	constructor({ mode, routes, baseUrl, fallbackRoute, trailingSlash, fetchHandler, templateRenderer, collections, imageOptimizer }: StaticSiteHandlerOptions) {
		this.#BASE_URL = new URL(baseUrl);

		this.#fetchHandler = fetchHandler;
		this.#imageOptimizer = new ImageOptimizer(imageOptimizer);
		this.#templateRenderer = new TemplateRenderer({
			...templateRenderer,
			imageOptimizer: this.#imageOptimizer
		});
		this.#collections = new Collections({
			...collections,
			imageOptimizer: this.#imageOptimizer,
			templateRenderer: this.#templateRenderer
		});

		this.#collections.mode = mode ?? 'development';

		const normalizedFallbackRoute: GenericRenderRouteView = {
			resolveParams: fallbackRoute?.resolveParams,
			render: fallbackRoute?.render ?? (() => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } }))
		};

		if (fallbackRoute?.renderHtml) {
			normalizedFallbackRoute.render = async ({ url }) => {
				const body = await this.#templateRenderer.renderTemplate(
					fallbackRoute.renderHtml.template,
					{ ...(fallbackRoute.renderHtml.data ?? {}), url }
				);

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			};
		}

		this.#fallbackRoute = normalizedFallbackRoute;

		this.#routes.push([new URLPattern({ ...this.#BASE_URL, pathname: `${this.#templateRenderer.templatesPath}*` }), normalizedFallbackRoute]);
		this.#routes.push([new URLPattern({ ...this.#BASE_URL, pathname: `${this.#collections.collectionsPath}*` }), normalizedFallbackRoute]);

		this.#routes.push([new URLPattern({ ...this.#BASE_URL, pathname: `${this.#imageOptimizer.publicAssetsPath}*` }), {
			render: async ({ url }) => this.#imageOptimizer.fetchImage(url.pathname)
		}]);

		Object.entries(routes).forEach(([path, route]) => {
			const resolvedUrl = new URL(path, this.#BASE_URL);
			let resolvedPath = resolvedUrl.pathname;

			switch (trailingSlash) {
				case 'always':
					resolvedPath = `${resolvedPath.replace(/\/$/iu, '')}/`;
					break;
				case 'never':
					resolvedPath = resolvedPath.replace(/\/$/iu, '');
					break;
				case 'ignore':
				case undefined:
				default: {
					resolvedPath = `${resolvedPath.replace(/\/$/iu, '')}{/}?`;
					break;
				}
			}

			this.#routes.push([new URLPattern({ ...resolvedUrl, pathname: resolvedPath }), {
				resolveParams: route.resolveParams,
				render: route.render ?? (async ({ url }) => {
					const body = await this.#templateRenderer.renderTemplate(
						route.renderHtml.template,
						{ ...(route.renderHtml.data ?? {}), url }
					);

					return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
				})
			}]);
		});
	}

	#isPatternDynamic(pattern: URLPattern) {
		if (pattern.pathname.endsWith('{/}?')) {
			return false;
		}

		if (pattern.hasRegExpGroups) {
			return true;
		}

		return false;
	}

	async #resolveRoute(url: string) {
		const resolvedUrl = new URL(url, this.#BASE_URL);
		const [pattern, route] = this.#routes.find(([curPattern]) => curPattern.test(resolvedUrl.href)) ?? [];

		if (!pattern || !route) {
			return;
		}

		if (this.#isPatternDynamic(pattern) && !route.resolveParams) {
			console.error(`Dynamic route for url "${url}" does not provide "resolveParams" function.`);
			return;
		}

		if (route?.resolveParams) {
			let resolvedRoutes = this.#resolvedRoutes.get(pattern);

			if (!resolvedRoutes) {
				resolvedRoutes = await route.resolveParams({
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
						collections: this.#collections,
						imageOptimizer: this.#imageOptimizer,
						templateRenderer: this.#templateRenderer,
						params: pattern.exec(resolvedUrl) ?? undefined,
						url: resolvedUrl
					});
				} catch (err) {
					console.error(`Error rendering route: ${url}.`);
					console.error(err);
				}
			}
		}

		return route.render({
			collections: this.#collections,
			imageOptimizer: this.#imageOptimizer,
			templateRenderer: this.#templateRenderer,
			url: resolvedUrl
		});
	}

	async build(fileSystemModule: FileSystemModule, outputPath: string, publicDir: string) {
		this.#collections.mode = 'production';

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
						collections: this.#collections,
						imageOptimizer: this.#imageOptimizer,
						templateRenderer: this.#templateRenderer,
						url: new URL(resolvedPath, this.#BASE_URL)
					});

					const file = await (await response.blob()).bytes();
					let filePath = resolvedPath;

					if (filePath.endsWith('/')) {
						filePath += 'index.html';
					}

					if (!extname(filePath)) {
						filePath += '.html';
					}

					const resolvedFilePath = join(outputPath, filePath);
					const resolvedFolder = dirname(resolvedFilePath);

					await fileSystemModule.mkdir(resolvedFolder, { recursive: true });
					await fileSystemModule.writeFile(resolvedFilePath, file);
				} catch (err) {
					console.error(`Error writing file for route: ${resolvedPath}.`);
					console.error(err);
				}
			}
		}

		const assetsManifest = this.#imageOptimizer.generateManifest();
		const assetsManifestPath = `${outputPath}${this.#imageOptimizer.assetsManifestPath}`;

		await fileSystemModule.writeFile(assetsManifestPath, JSON.stringify(assetsManifest));
		for (const imagePublicPath of Object.values(assetsManifest)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const imageResponse = this.#imageOptimizer.getImageResponse(imagePublicPath)!;
			const file = await (await imageResponse.blob()).bytes();

			await fileSystemModule.writeFile(imagePublicPath, file);
		}
	}

	async fetch<CfHostMetadata = unknown>(request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, context: ExecutionContext) {
		const resolvedResponse = await this.#resolveRoute(request.url);

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
			collections: this.#collections,
			imageOptimizer: this.#imageOptimizer,
			templateRenderer: this.#templateRenderer,
			url: new URL(request.url)
		});
	}
}
