import { env } from 'cloudflare:workers';
import type { TemplateRenderingAttributes } from '../TemplateRenderer.ts';
import { ValueHandler } from './ValueHandler.ts';

export class ImportHandler implements HTMLRewriterElementContentHandlers {
	#attributes: TemplateRenderingAttributes;

	constructor(attributes: TemplateRenderingAttributes) {
		this.#attributes = attributes;
	}

	async element(element: Element) {
		const filePath = element.getAttribute('href');

		if (!filePath) {
			console.warn('Missing import file!');
			return;
		}

		let importData: Record<string, unknown> = {};

		[...element.attributes].forEach((attr) => {
			if (attr.name === this.#attributes.importData) {
				return;
			}

			if (attr.name.startsWith(this.#attributes.attributeBinding)) {
				importData[attr.name.replace(this.#attributes.attributeBinding, '')] = ValueHandler.processInterpolation(attr.value, data);

				element.removeAttribute(attr.name);
			} else {
				importData[attr.name] = attr.value;
			}
		});

		if (element.hasAttribute(this.#attributes.importData)) {
			importData = {
				...importData,
				...ValueHandler.getValue(element.getAttribute(this.#attributes.importData) ?? '', data)
			};
		}

		const response = await env.Assets.fetch(new URL(filePath, this.#TEMPLATES_URL));
		const text = await response.text();

		element.innerHTML = text;
	}
}
