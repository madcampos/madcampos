/// <reference types="urlpattern-polyfill" />

interface FileSystemModule {
	writeFile(path: string, data: Uint8Array | string): Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	mkdir(path: string, options?: { recursive?: boolean }): Promise<string | void>;
	cp(src: string, dest: string, options?: { force?: boolean, recursive?: boolean }): Promise<void>;
	glob(pattern: string): AsyncIterable<string>;
}

interface BaseRouteView {
	resolveParams?(assets: Env['Assets'], params: { url: URLPattern }): Promise<string[]> | string[];
}

interface GenericRenderRouteView extends BaseRouteView {
	render(assets: Env['Assets'], params: { path: string, url: string, params?: URLPatternResult, data?: unknown }): Promise<Response> | Response;
	renderHtml?: never;
}

interface HtmlRenderRouteView extends BaseRouteView {
	render?: never;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	renderHtml: { template: string, data: any };
}

export type RouteView = GenericRenderRouteView | HtmlRenderRouteView;

interface StaticSiteHandlerOptions {
	baseUrl: string;
	routes: Record<string, RouteView>;
	fallbackRoute?: RouteView;
	trailingSlash?: 'always' | 'ignore' | 'never';
	fetchHandler?: ExportedHandlerFetchHandler;
	collectionAssetsHandler?(assets: Env['Assets'], assetPath: string): Promise<Response>;
}

export class StaticSiteHandler {
	#TEMPLATES_FOLDER = '_templates';
	#COLLECTIONS_FOLDER = '_data';
	#COLLECTION_ASSETS_FOLDER = '_assets';
	#PATH_WITH_EXT_REGEX = /\/([^/]+?)\.[a-z0-9]+?$/iu;
	#TRAILING_SLASHES_REGEX = /\/$/iu;
	#FORBIDDEN_CHARS_IN_FILES_REGEX = /[\\<>:"|?*]/giu;

	#baseUrl: string;
	#routes: [URLPattern, GenericRenderRouteView][] = [];
	#resolvedRoutes = new Map<URLPattern, string[]>();
	#fallbackRoute: GenericRenderRouteView = {
		render: () => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
	};
	#fetchHandler?: ExportedHandlerFetchHandler;

	constructor({ routes, baseUrl, fallbackRoute, trailingSlash, fetchHandler, collectionAssetsHandler }: StaticSiteHandlerOptions) {
		this.#baseUrl = baseUrl;
		this.#fetchHandler = fetchHandler;

		const normalizedFallbackRoute: GenericRenderRouteView = {
			resolveParams: fallbackRoute?.resolveParams,
			render: fallbackRoute?.render ?? this.#fallbackRoute.render
		};

		if (fallbackRoute?.renderHtml) {
			normalizedFallbackRoute.render = async (assets, { url }) => {
				const body = await templateRenderer.renderTemplate(assets, fallbackRoute.renderHtml.template, { ...(fallbackRoute.renderHtml.data ?? {}), url });

				return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
			};
		}

		this.#routes.push([new URLPattern(`/${this.#TEMPLATES_FOLDER}{/}?*`, this.#baseUrl), normalizedFallbackRoute]);
		this.#routes.push([new URLPattern(`/${this.#COLLECTIONS_FOLDER}{/}?*`, this.#baseUrl), normalizedFallbackRoute]);

		if (collectionAssetsHandler) {
			this.#routes.push([new URLPattern(`/${this.#COLLECTION_ASSETS_FOLDER}{/}?*`, this.#baseUrl), {
				render: async (assets, { path }) => collectionAssetsHandler(assets, path)
			}]);
		}

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

			this.#routes.push([new URLPattern(resolvedPath, this.#baseUrl), {
				resolveParams: route.resolveParams,
				render: route.render ?? (async (assets, { url }) => {
					const body = await templateRenderer.renderTemplate(assets, route.renderHtml.template, { ...(route.renderHtml.data ?? {}), url });

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
		const resolvedUrl = new URL(url, this.#baseUrl);
		const [pattern, route] = this.#routes.find(([curPattern]) => curPattern.test(resolvedUrl.pathname, this.#baseUrl)) ?? [];

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
				resolvedRoutes = await route.resolveParams(assets, { url: pattern });

				this.#resolvedRoutes.set(pattern, resolvedRoutes);
			}

			const resolvedPath = resolvedRoutes.find((path) => path === resolvedUrl.pathname);

			if (resolvedPath) {
				try {
					return await route.render(assets, { path: resolvedPath, url });
				} catch (err) {
					console.error(`Error rendering route: ${url}.`);
					console.error(err);
				}
			}
		}

		return route.render(assets, { path: resolvedUrl.pathname, url });
	}

	async build(assets: Env['Assets'], fileSystemModule: FileSystemModule, outputPath: string, publicDir: string) {
		await fileSystemModule.mkdir(outputPath, { recursive: true });

		for await (const entry of fileSystemModule.glob(`${publicDir}/**/*`)) {
			if (entry.startsWith(`${publicDir}/${this.#TEMPLATES_FOLDER}`) || entry.startsWith(`${publicDir}/${this.#COLLECTIONS_FOLDER}`)) {
				continue;
			}

			await fileSystemModule.cp(publicDir, outputPath, { force: true, recursive: true });
		}

		for (const [pattern, route] of this.#routes) {
			const resolvedRoutes: string[] = [];

			if (route.resolveParams) {
				resolvedRoutes.push(
					...await route.resolveParams(assets, { url: pattern })
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
					const response = await route.render(assets, { path: resolvedPath, url: `${this.#baseUrl}${resolvedPath}` });

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

		return this.#fallbackRoute.render(env.Assets, { path: new URL(request.url).pathname, url: request.url });
	}
}
