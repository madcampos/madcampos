import { platformFetch } from '../FetchHandler.ts';
import type { BaseElementHandler } from './BaseHandler.ts';
import { ValueHandler } from './ValueHandler.ts';

/**
 * A function to render the component, if receives the processed attributes for the component as it's data.
 *
 * E.g.: With the following HTML:
 * ```html
 * <x-component foo="foo" bar="{{bar}}"></x-component>
 * ```
 *
 * The component function call will look like this:
 * ```typescript
 * componentFunction({ foo: 'foo', bar: '[processed value of "bar"]'});
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentFunction = (data: any) => Promise<string> | string;

/**
 * A list of components where the key is the component tag name and the value either the path for the component file or a rendering function.
 *
 * E.g.:
 * ```typescript
 * {
 * 	'x-component-function': () => '[component template]',
 * 	'x-component-path': 'path/to/component.html'
 * }
 * ```
 *
 * @see {@link ComponentFunction}
 */
export type ComponentReferenceList = Record<string, ComponentFunction | string>;

export class CustomElementHandler<T> implements HTMLRewriterElementContentHandlers, BaseElementHandler {
	static readonly selector = '*';

	/**
	 * The attribute used to skips processing of the component completely.
	 * No transformations will happen on this element, it will only have it's internals outputted to a shadom DOM.
	 *
	 * This is an optimization option but should be not necessary for most components.
	 */
	static skipProcessingAttribute = '@no-process';

	/**
	 * The attribute used to skip the declarative shadow DOM.
	 *
	 * When present the template contents of the element are outputted to it directly, without wrapping them in a `<template>` tag.
	 * This is useful if the component already returns a declarative shadow DOM template.
	 * It is also useful if the component is used mostly for layout and not for the shadow DOM encapsulation.
	 */
	static skipShadowDomAttribute = '@no-shadowdom';

	/**
	 * The marker to use before an attribute to bind it to a variable, instead of a string.
	 */
	static bindingattribute = ':';

	/**
	 * The folder inside the assets folder where templates will live.
	 *
	 * Both components and page template paths are appended to this path when requesting the HTML files.
	 */
	static TEMPLATES_URL = new URL('_templates/', 'https://assets.local/');

	/**
	 * A JSON file listing components to look for.
	 * If the file exists, the components listed will be merged with the component list.
	 *
	 * It should be an object where each key is the component name.
	 * The values are strings pointing to a component template html file.
	 *
	 * The entry paths is relative to the templates folder.
	 */
	static COMPONENTS_INDEX_URL = new URL('components/index.json', CustomElementHandler.TEMPLATES_URL);

	#componentCache: ComponentReferenceList = {};
	#isIndexFetched = false;
	#componentPaths: ComponentReferenceList;

	#data: T;

	constructor(components: ComponentReferenceList, data: T) {
		this.#componentPaths = Object.fromEntries(Object.entries(components ?? {}).map(([key, value]) => [key.toLowerCase(), value]));

		this.#data = data;
	}

	async #initTemplates() {
		if (!this.#isIndexFetched) {
			try {
				const response = await platformFetch(CustomElementHandler.COMPONENTS_INDEX_URL);

				if (!response.ok) {
					throw new Error(`Failed to fetch templates index file at: ${CustomElementHandler.COMPONENTS_INDEX_URL.pathname}`);
				}

				const componentsJson = Object.fromEntries(Object.entries(await response.json() satisfies Record<string, string>).map(([key, value]) => [key.toLowerCase(), value]));

				this.#componentPaths = {
					...componentsJson,
					...this.#componentPaths
				};

				this.#isIndexFetched = true;
			} catch (err) {
				console.error(err);
			}
		}
	}

	async #getComponentText(elementTag: string) {
		await this.#initTemplates();

		if (!this.#componentPaths[elementTag]) {
			return;
		}

		if (!this.#componentCache[elementTag]) {
			if (typeof this.#componentPaths[elementTag] === 'string') {
				const templatePath = this.#componentPaths[elementTag];
				const response = await platformFetch(new URL(templatePath, CustomElementHandler.TEMPLATES_URL));

				if (!response.ok) {
					this.#componentCache[elementTag] = '';

					throw new Error(`Failed to fetch component "${elementTag}" template at: ${templatePath}`);
				}

				const text = await response.text();

				this.#componentCache[elementTag] = text;
			} else {
				this.#componentCache[elementTag] = this.#componentPaths[elementTag];
			}
		}

		return this.#componentCache[elementTag];
	}

	async element(element: Element) {
		if (!element.tagName.includes('-')) {
			return;
		}

		let componentTextOrFunction = await this.#getComponentText(element.tagName.toLowerCase());

		if (!componentTextOrFunction) {
			return;
		}

		const componentData: Record<string, unknown> = {};

		([...element.attributes] as [string, string][]).forEach(([key, value]) => {
			if (key.startsWith(CustomElementHandler.bindingattribute)) {
				componentData[key.replace(CustomElementHandler.bindingattribute, '')] = ValueHandler.processInterpolation(value, this.#data);

				element.removeAttribute(key);
			} else {
				componentData[key] = value;
			}
		});

		if (typeof componentTextOrFunction === 'function') {
			componentTextOrFunction = await componentTextOrFunction(componentData);
		}

		if (element.hasAttribute(CustomElementHandler.skipShadowDomAttribute)) {
			element.prepend(componentTextOrFunction, { html: true });
		} else {
			element.prepend(`<template shadowrootmode="open">${componentTextOrFunction}</template>`, { html: true });
		}

		if (element.hasAttribute(CustomElementHandler.skipProcessingAttribute)) {
			return;
		}

		// TODO: recurse into this component?
		// this.#processNodes([processedComponent], {
		// 	...this.#data,
		// 	...componentData
		// });

		element.removeAttribute(CustomElementHandler.skipProcessingAttribute);
		element.removeAttribute(CustomElementHandler.skipShadowDomAttribute);
	}
}
