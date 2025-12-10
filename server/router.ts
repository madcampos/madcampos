/* eslint-disable @typescript-eslint/no-invalid-void-type */

type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}` ? FilteredParts<PartB> | IsParameter<PartA>
	: IsParameter<Path>;

type Params<Path> = Record<FilteredParts<Path>, string>;

export interface RouteLocation<Path = string> {
	path: Path;
	params: Params<Path>;
	query?: Record<string, string | undefined>;
	hash?: string;
}

type ResponseHandler = (request: Request) => Response | Promise<Response>;

interface RouteDefinition {
	path: string;
	handler: ResponseHandler;
}

interface RouterConfig {
	routes: RouteDefinition[];
	fallback?: ResponseHandler;
}

export class Router {
	static #routes: [URLPattern, ResponseHandler][] = [];
	static readonly #fallbackPattern = new URLPattern({ pathname: '*' });

	static fallback: ResponseHandler | undefined;

	static add<T extends ViewImplementation>(path: string, ViewClass: T) {
		const view = new ViewClass();

		view.dataset['routerView'] = '';

		Router.#routes.push([new URLPattern({ pathname: path }), view]);

		Router.renderTarget.appendChild(view as unknown as Node);
	}

	static async navigate(request: Request) {
		try {
			const newPath = new URL(path, Router.#baseUrl).pathname;

			if (Router.#currentPath === newPath) {
				return;
			}

			const guardResult = await Router.beforeEach?.(this.#currentPath, newPath);

			if (guardResult === false) {
				return;
			}

			const pathToSearch = guardResult?.path ?? newPath;

			const [matcher, view] = Router.#routes.find(([pattern]) => pattern.test(pathToSearch, this.#baseUrl)) ?? [];

			if (matcher !== undefined && view) {
				const destinationMatcher = matcher.exec(pathToSearch, Router.#baseUrl);
				const destination: RouteLocation = {
					path: pathToSearch,
					params: destinationMatcher?.pathname.groups ?? {},
					query: destinationMatcher?.search.groups ?? {},
					hash: destinationMatcher?.hash.input
				};

				const title = await view.navigate?.(destination, Router.#currentLocation) ?? undefined;

				Router.#routes.forEach(([, otherView]) => {
					delete otherView.dataset['activeView'];
				});

				view.dataset['activeView'] = '';

				Router.#currentPath = pathToSearch;
				Router.#currentLocation = destination;

				const basePath = new URL(Router.#baseUrl).pathname.replace(/\/$/u, '');
				const normalizedPath = new URL(`${basePath}${path}`, Router.#baseUrl).pathname;

				window.history.pushState(null, '', normalizedPath);

				if (title) {
					window.document.title = `${title} · ${Router.appTitle}`;
				} else {
					window.document.title = Router.appTitle;
				}
			}
		} catch (err) {
			console.error(`[⛵️] Error while navigating to ${path}:`, err);
		}
	}

	static init({
		routes,
		fallback
	}: RouterConfig) {
		routes.forEach(({ path, handler: view }) => Router.add(path, view));

		if (fallback) {
			// TODO: add direct handler to '*'
			// Router.fallback = fallback;
		}

		console.info('[⛵️] Router initialized');
	}
}

import './router-link';
