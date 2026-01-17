export type ResponseHandler = (request: Request, env: Env, context: ExecutionContext) => Promise<Response> | Response;

export type HTTPMethod =
	| 'GET'
	| 'HEAD'
	| 'POST'
	| 'PUT'
	| 'DELETE'
	| 'OPTIONS'
	| 'PATCH';

interface StaticSiteHandlerOptions {
	routes: Record<string, ResponseHandler>;
	fallbackRoute?: ResponseHandler;
}

export class Router {
	#routes: Record<HTTPMethod, [URLPattern, ResponseHandler][]> = {
		GET: [],
		HEAD: [],
		POST: [],
		PUT: [],
		DELETE: [],
		OPTIONS: [],
		PATCH: []
	};
	#fallbackRoute: ResponseHandler;

	constructor({ routes, fallbackRoute }: StaticSiteHandlerOptions) {
		this.#fallbackRoute = fallbackRoute ?? (() => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } }));

		Object.entries(routes).forEach(([methodAndPath, route]) => {
			const { method = 'get', path = '' } = methodAndPath.match(/^(?:(?<method>[a-z]+) )?(?<path>.+?)$/iu)?.groups ?? {};

			const methodRoutes = this.#routes[method.toUpperCase() as HTTPMethod];

			if (methodRoutes) {
				methodRoutes.push([new URLPattern({ pathname: path }), route]);
			} else {
				throw new TypeError(`Path "${path}" has an invalid HTTP Method ("${method}").`);
			}
		});
	}

	async fetch<CfHostMetadata = unknown>(request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, context: ExecutionContext) {
		const resolvedUrl = new URL(request.url);
		const methodRoutes = this.#routes[request.method as HTTPMethod];
		const [pattern, routeHandler] = methodRoutes.find(([curPattern]) => curPattern.test(resolvedUrl.href)) ?? [];

		if (!pattern || !routeHandler) {
			return this.#fallbackRoute(request, env, context);
		}

		return routeHandler(request, env, context);
	}
}
