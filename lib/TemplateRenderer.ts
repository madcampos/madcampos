import { env } from 'cloudflare:workers';
import type { ImageOptimizer } from './ImageOptimizer.ts';
import { ValueHandler } from './template/ValueHandler.ts';

/**
 * The special attributes to do if checks, loops, etc.
 */
export interface TemplateRenderingAttributes {
	/**
	 * The attribute used for looping over the tag multiple times.
	 * @default '@for'
	 */
	loop: string;

	/**
	 * The string used to separate `item` and `list` from the loop attribute from {@link TemplateRendererOptions}.
	 * E.g.: given the HTML below:
	 * ```html
	 * <ul>
	 * 	<li @for="item in list">{{item}}</li>
	 * </ul>
	 * ```
	 * The `in` separator will be used to define `list` as the list to look for in the data and `item` as the name that each item in the list will use when handling the contents of the element.
	 *
	 * @default 'in'
	 */
	loopOperator: string;

	/**
	 * The marker to use before an attribute to bind it to a variable, instead of a string.
	 * @default ':'
	 */
	attributeBinding: string;
}

export interface TemplateRendererOptions {
	/**
	 * An instance of {@link ImageOptimizer}.
	 */
	imageOptimizer: ImageOptimizer;

	/**
	 * The special attributes to do if checks, loops, etc.
	 */
	attributes?: Partial<TemplateRenderingAttributes>;
}

export class TemplateRenderer {
	#attributes: TemplateRenderingAttributes = {
		loop: '@for',
		loopOperator: 'in',
		attributeBinding: ':'
	};

	constructor({ attributes }: TemplateRendererOptions) {
		this.#attributes = {
			...this.#attributes,
			...(attributes ?? {})
		};
	}

	#parse(text: string) {
		return parse(text, {
			comment: true,
			parseNoneClosedTags: true,
			fixNestedATags: true,
			voidTag: { closingSlash: true },
			blockTextElements: {
				script: true,
				noscript: true,
				style: true,
				pre: true
			}
		});
	}

	async #processLoop<T>(element: HTMLElement, data: T) {
		const loopResults: Node[][] = [];
		const [itemName, listPath] = element.getAttribute(this.#attributes.loop)?.split(this.#attributes.loopOperator) ?? [];
		let list = ValueHandler.getValue(listPath?.trim() ?? '', data);

		if (typeof list === 'string') {
			list = [...list];
		}

		if (!list) {
			console.error(`Missing list "${(listPath ?? '').trim()}" for loop on element "${element.tagName?.toLowerCase()}"`);
		} else if (!itemName) {
			console.error(`Missing list item name for loop on element "${element.tagName.toLowerCase()}"`);
		} else {
			element.removeAttribute(this.#attributes.loop);

			for (const itemValue of list) {
				const itemData = {
					...(data ?? {}),
					[itemName?.trim() ?? '']: itemValue
				};
				const clonedElements = await this.#processNodes([element.clone() as HTMLElement], itemData);

				loopResults.push(clonedElements);
			}
		}

		return loopResults.flat();
	}

	#processAttributes<T>(attributes?: Record<string, string>, data?: T) {
		const normalizedAttributes = attributes ?? {};

		const { openDelimiter, closeDelimiter } = this.#attributes;

		for (const [attr, value] of Object.entries(normalizedAttributes)) {
			if (attr === this.#attributes.loop) {
				continue;
			}

			if (attr.startsWith(this.#attributes.attributeBinding)) {
				continue;
			}

			normalizedAttributes[attr] = value.replaceAll(
				new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu'),
				(_, matchValue) => ValueHandler.formatValue(ValueHandler.processInterpolation(matchValue, data))
			);
		}

		return normalizedAttributes;
	}

	async #processNodes<T>(nodes: Node[], data: T) {
		type MaybeNode = Node | undefined;
		const processedNodes: (MaybeNode | MaybeNode[])[] = [...nodes];

		for (const [index, node] of nodes.entries()) {
			if (node instanceof HTMLElement) {
				if (node.hasAttribute(this.#attributes.loop)) {
					processedNodes[index] = await this.#processLoop(node, data);
					continue;
				}

				if (node.childNodes.length > 0) {
					node.childNodes = await this.#processNodes(node.childNodes, data);
				}

				continue;
			}

			if (Array.isArray(node)) {
				processedNodes[index] = await this.#processNodes(node, data);
			}
		}

		return processedNodes.flat().filter((node) => node !== undefined);
	}

	/**
	 * Renders the given template path using the provided data.
	 *
	 * It returns a string of the rendered HTML.
	 */
	async renderTemplate<T>(template: string, data?: T) {
		const response = await env.Assets.fetch(new URL(template, this.#TEMPLATES_URL));
		const text = await response.text();
		const parsedDocument = this.#parse(text);

		parsedDocument.childNodes = await this.#processNodes(parsedDocument.childNodes, data);

		return parsedDocument.outerHTML;
	}

	async renderString<T>(text: string, data?: T) {
		const parsedDocument = this.#parse(text);

		parsedDocument.childNodes = await this.#processNodes(parsedDocument.childNodes, data);

		return parsedDocument.outerHTML;
	}
}
