export type ResponseHandler = (request: Request, env: Env, context: ExecutionContext) => Promise<Response> | Response;

interface StaticSiteHandlerOptions {
	routes: Record<string, ResponseHandler>;
	fallbackRoute?: ResponseHandler;
}

export class Router {
	#routes: [URLPattern, ResponseHandler][] = [];
	#fallbackRoute: ResponseHandler;

	constructor({ routes, fallbackRoute }: StaticSiteHandlerOptions) {
		this.#fallbackRoute = fallbackRoute ?? (() => new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } }));

		Object.entries(routes).forEach(([path, route]) => {
			this.#routes.push([new URLPattern({ pathname: path }), route]);
		});
	}

	async fetch<CfHostMetadata = unknown>(request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, context: ExecutionContext) {
		const resolvedUrl = new URL(request.url);
		const [pattern, routeHandler] = this.#routes.find(([curPattern]) => curPattern.test(resolvedUrl.href)) ?? [];

		if (!pattern || !routeHandler) {
			return this.#fallbackRoute(request, env, context);
		}

		return routeHandler(request, env, context);
	}
}
