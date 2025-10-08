import { env } from 'cloudflare:workers';
import type { BaseElementHandler } from './BaseHandler.ts';
import { ValueHandler } from './ValueHandler.ts';

export class ImportHandler<T> implements HTMLRewriterElementContentHandlers, BaseElementHandler {
	/**
	 * The folder inside the assets folder where templates will live.
	 *
	 * Both components and page template paths are appended to this path when requesting the HTML files.
	 */
	static TEMPLATES_URL = new URL('_templates/', 'https://assets.local/');

	/**
	 * The attribute for specifying an extra object when doing an HTML import.
	 * When a `<meta rel="import" />` tag is found it will use the element's attributes as the data passed to the template to import.
	 *
	 * This attribute adds the property referenced as an extra property bag passed down to the template as data when rendering it.
	 */
	static importDataAttribute = '@data';

	/**
	 * The marker to use before an attribute to bind it to a variable, instead of a string.
	 */
	static bindingAttribute = ':';

	static readonly selector = `meta[rel="import"]`;

	#data: T;

	constructor(data: T) {
		this.#data = data;
	}

	async element(element: Element) {
		const filePath = element.getAttribute('href');

		if (!filePath) {
			console.warn('Missing import file!');
			return;
		}

		let importData: Record<string, unknown> = {};

		([...element.attributes] as [string, string][]).forEach(([name, value]) => {
			if (name === ImportHandler.importDataAttribute) {
				return;
			}

			if (name.startsWith(ImportHandler.bindingAttribute)) {
				importData[name.replace(ImportHandler.bindingAttribute, '')] = ValueHandler.processInterpolation(value, this.#data);

				element.removeAttribute(name);
			} else {
				importData[name] = value;
			}
		});

		if (element.hasAttribute(ImportHandler.importDataAttribute)) {
			importData = {
				...importData,
				...ValueHandler.getValue(element.getAttribute(ImportHandler.importDataAttribute) ?? '', this.#data)
			};
		}

		const response = await env.Assets.fetch(new URL(filePath, ImportHandler.TEMPLATES_URL));
		const text = await response.text();

		// TODO: parse html?
		element.replace(text, { html: true });
	}
}
