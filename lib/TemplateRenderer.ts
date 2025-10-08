/* eslint-disable @typescript-eslint/no-shadow, max-lines */

import { env } from 'cloudflare:workers';
import { type Node, HTMLElement, TextNode } from 'node-html-parser';
import { parse } from 'node-html-parser';
import type { ImageOptimizer } from './ImageOptimizer.ts';

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
export type ComponentReferenceList = Record<string, ComponentFunction | string>;

/**
 * A function to apply a transformation filter to a value.
 * This will transform the value referenced by a data variable.
 * E.g.: With the following HTML:
 * ```html
 * <div>
 * 	{{data.dateValue | formatDate en-US, long-date, long-time}}
 * </div>
 * ```
 *
 * This will call the the following filter function with the following parameters:
 * ```typescript
 * formatDate(data.dateValue, 'en-US', 'long-date', 'long-time');
 * ```
 */
export type FilterFunction = <T, R>(data: T, ...params: string[]) => Promise<R> | R;

/**
 * The special attributes to do if checks, loops, etc.
 */
export interface TemplateRenderingAttributes {
	/**
	 * The attribute used for if checks.
	 * @default '@if'
	 */
	if: string;

	/**
	 * The attribute used for negative checks (_"if not x"_).
	 * @default '@if-not'
	 */
	ifNot: string;

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
	 * The attribute used to skips processing of the component completely.
	 * No transformations will happen on this element, it will only have it's internals outputted to a shadom DOM.
	 *
	 * This is an optimization option but should be not necessary for most components.
	 * @default '@no-process'
	 */
	skipProcessing: string;

	/**
	 * The attribute used to skip the declarative shadow DOM.
	 *
	 * When present the template contents of the element are outputted to it directly, without wrapping them in a `<template>` tag.
	 * This is useful if the component already returns a declarative shadow DOM template.
	 * It is also useful if the component is used mostly for layout and not for the shadow DOM encapsulation.
	 * @default '@no-shadowdom'
	 */
	skipShadowDom: string;

	/**
	 * The attribute for specifying an extra object when doing an HTML import.
	 * When a `<meta rel="import" />` tag is found it will use the element's attributes as the data passed to the template to import.
	 *
	 * This attribute adds the property referenced as an extra property bag passed down to the template as data when rendering it.
	 * @default '@data'
	 */
	importData: string;

	/**
	 * The attribute for setting the image quality for processing the images.
	 * If not present, the default quality will be used.
	 * @default '@quality'
	 */
	imageQuality: string;

	/**
	 * The attribute for setting the image widths for generating a `srcset`.
	 * If not present, the default quality will be used.
	 * @default '@widths'
	 */
	imageWidths: string;

	/**
	 * The attribute for setting the image densities for generating a `srcset`.
	 * If not present, the default quality will be used.
	 * @default '@densities'
	 */
	imageDensities: string;

	/**
	 * The attribute for skipping image optimization.
	 * @default '@no-optimize'
	 */
	skipImageOptimization: string;

	/**
	 * The open delimiter for interpolating data.
	 * @default '\\{\\{'
	 */
	openDelimiter: string;

	/**
	 * The close delimiter for interpolating data.
	 * @default '\\}\\}'
	 */
	closeDelimiter: string;

	/**
	 * The open delimiter for interpolating **unescaped** data.
	 * @default '\\{\\{\\{'
	 */
	unescapedOpenDelimiter: string;

	/**
	 * The close delimiter for interpolating **unescaped** data.
	 * @default '\\}\\}\\}'
	 */
	unescapedCloseDelimiter: string;

	/**
	 * The marker to use before an attribute to bind it to a variable, instead of a string.
	 * @default ':'
	 */
	attributeBinding: string;

	/**
	 * Character to use for separating filters from values.
	 * @default '|'
	 */
	filterSeparator: string;
}

export interface TemplateRendererOptions {
	/**
	 * An instance of {@link ImageOptimizer}.
	 */
	imageOptimizer: ImageOptimizer;

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
	components?: ComponentReferenceList;

	/**
	 * A JSON file listing components to look for.
	 * If the file exists, the components listed will be merged with the component list.
	 *
	 * It should be an object where each key is the component name.
	 * The values are strings pointing to a component template html file.
	 *
	 * The entry paths is relative to the templates folder.
	 * @default 'components/index.json'
	 */
	componentIndex?: string;

	/**
	 * The folder inside the assets folder where templates will live.
	 *
	 * Both components and page template paths are appended to this path when requesting the HTML files.
	 * @default '_templates'
	 */
	templatesFolder?: string;

	/**
	 * The special attributes to do if checks, loops, etc.
	 */
	attributes?: Partial<TemplateRenderingAttributes>;

	/**
	 * List of filter functions to provide. This list will be added on top of existing filters.
	 */
	filters?: Record<string, FilterFunction>;
}

export class TemplateRenderer {
	#TEMPLATES_URL: URL;
	#COMPONENTS_INDEX_URL: URL;
	#attributes: TemplateRenderingAttributes = {
		if: '@if',
		ifNot: '@if-not',
		loop: '@for',
		loopOperator: 'in',
		skipProcessing: '@no-process',
		skipShadowDom: '@no-shadowdom',
		importData: '@data',
		imageQuality: '@quality',
		imageWidths: '@widths',
		imageDensities: '@densities',
		skipImageOptimization: '@no-optimize',
		openDelimiter: '\\{\\{',
		closeDelimiter: '\\}\\}',
		unescapedOpenDelimiter: '\\{\\{\\{',
		unescapedCloseDelimiter: '\\}\\}\\}',
		attributeBinding: ':',
		filterSeparator: '|'
	};
	#componentCache: ComponentReferenceList = {};
	#isIndexFetched = false;
	#componentPaths: ComponentReferenceList;
	#imageOptimizer: ImageOptimizer;
	#filters: Record<string, FilterFunction>;

	constructor({ imageOptimizer, components, componentIndex, templatesFolder, attributes, filters }: TemplateRendererOptions) {
		this.#imageOptimizer = imageOptimizer;

		this.#componentPaths = Object.fromEntries(Object.entries(components ?? {}).map(([key, value]) => [key.toLowerCase(), value]));

		this.#TEMPLATES_URL = new URL(templatesFolder ?? '_templates/', 'https://assets.local/');
		this.#COMPONENTS_INDEX_URL = new URL(componentIndex ?? 'components/index.json', this.#TEMPLATES_URL);

		this.#attributes = {
			...this.#attributes,
			...(attributes ?? {})
		};

		this.#filters = {
			...(filters ?? {})
		};
	}

	get templatesPath() {
		return this.#TEMPLATES_URL.pathname;
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

	async #initTemplates() {
		if (!this.#isIndexFetched) {
			try {
				const response = await env.Assets.fetch(this.#COMPONENTS_INDEX_URL);

				if (!response.ok) {
					throw new Error(`Failed to fetch templates index file at: ${this.#COMPONENTS_INDEX_URL.pathname}`);
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

	#getValue<T>(path: string, data?: T, shouldReport = true) {
		if (!path) {
			throw new Error('Missing property path!');
		}

		if (!data && shouldReport) {
			console.warn(`Missing data for property "${path}"`);
			return undefined;
		}

		const [firstPart, ...pathParts] = path.trim().split('.');

		if (!firstPart) {
			return undefined;
		}

		// @ts-expect-error
		let result = data?.[firstPart];
		let pathPartIndex = 0;

		if ((result === null || result === undefined) && shouldReport) {
			console.warn(`Missing data for property "${firstPart}"`);
			return undefined;
		}

		while (pathPartIndex < pathParts.length && result) {
			const pathPart = pathParts[pathPartIndex];

			if (result?.[pathPart]) {
				result = result[pathPart];
			} else {
				if (shouldReport) {
					console.warn(`Missing data for property "${firstPart}.${pathParts.slice(0, pathPartIndex + 1).join('.')}"`);
				}

				result = undefined;
			}

			pathPartIndex += 1;
		}

		return result;
	}

	#formatValue(value?: unknown) {
		if (value === null || value === undefined) {
			return '';
		}

		if (['string', 'number', 'boolean', 'bigint'].includes(typeof value)) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return value.toString();
		}

		if (typeof value === 'function') {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			const formattedResult = this.#formatValue(value()) as string;

			return formattedResult;
		}

		if ('toString' in (value as Object)) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return value.toString();
		}

		return '';
	}

	async #getComponentText(elementTag: string) {
		if (!this.#componentPaths[elementTag]) {
			return;
		}

		if (!this.#componentCache[elementTag]) {
			if (typeof this.#componentPaths[elementTag] === 'string') {
				const templatePath = this.#componentPaths[elementTag];
				const response = await env.Assets.fetch(new URL(templatePath, this.#TEMPLATES_URL));

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

	async #processComponent<T>(element: HTMLElement, data?: T) {
		let componentTextOrFunction = await this.#getComponentText(element.tagName.toLowerCase());

		if (!componentTextOrFunction) {
			return element as Node;
		}

		const processedComponent = element.clone() as HTMLElement;

		processedComponent.removeAttribute(this.#attributes.skipProcessing);
		processedComponent.removeAttribute(this.#attributes.skipShadowDom);

		const componentData: Record<string, unknown> = {};

		Object.entries(processedComponent.attributes).forEach(([key, value]) => {
			if (key.startsWith(this.#attributes.attributeBinding)) {
				componentData[key.replace(this.#attributes.attributeBinding, '')] = this.#processInterpolation(value, data);

				element.removeAttribute(key);
			} else {
				componentData[key] = value;
			}
		});

		if (typeof componentTextOrFunction === 'function') {
			componentTextOrFunction = await componentTextOrFunction(componentData);
		}

		if (element.hasAttribute(this.#attributes.skipShadowDom)) {
			processedComponent.insertAdjacentHTML('afterbegin', componentTextOrFunction);
		} else {
			processedComponent.insertAdjacentHTML('afterbegin', `<template shadowrootmode="open">${componentTextOrFunction}</template>`);
		}

		if (element.hasAttribute(this.#attributes.skipProcessing)) {
			return processedComponent as Node;
		}

		return this.#processNodes([processedComponent], {
			...data,
			...componentData
		});
	}

	#checkConditionalAttribute<T>(element: HTMLElement, data: T) {
		if (element.hasAttribute(this.#attributes.if)) {
			const value = this.#getValue(element.getAttribute(this.#attributes.if) ?? '', data, false);

			const falsyValues = ['', false, null, undefined] as const;
			if (falsyValues.includes(value) || Number.isNaN(value)) {
				return false;
			}
		}

		if (element.hasAttribute(this.#attributes.ifNot)) {
			const value = this.#getValue(element.getAttribute(this.#attributes.ifNot) ?? '', data, false);

			const falsyValues = ['', false, null, undefined] as const;
			if (!falsyValues.includes(value) && !Number.isNaN(value)) {
				return false;
			}
		}

		return true;
	}

	async #processImport<T>(element: HTMLElement, data: T) {
		const filePath = element.getAttribute('href');

		if (!filePath) {
			console.warn('Missing import file!');
			return;
		}

		let importData: Record<string, unknown> = {};

		Object.entries(element.attributes).forEach(([key, value]) => {
			if (key === this.#attributes.importData) {
				return;
			}

			if (key.startsWith(this.#attributes.attributeBinding)) {
				importData[key.replace(this.#attributes.attributeBinding, '')] = this.#processInterpolation(value, data);

				element.removeAttribute(key);
			} else {
				importData[key] = value;
			}
		});

		if (element.hasAttribute(this.#attributes.importData)) {
			importData = {
				...importData,
				...this.#getValue(element.getAttribute(this.#attributes.importData) ?? '', data)
			};
		}

		const response = await env.Assets.fetch(new URL(filePath, this.#TEMPLATES_URL));
		const text = await response.text();

		return this.#parse(text);
	}

	async #processLoop<T>(element: HTMLElement, data: T) {
		const loopResults: Node[][] = [];
		const [itemName, listPath] = element.getAttribute(this.#attributes.loop)?.split(this.#attributes.loopOperator) ?? [];
		let list = this.#getValue(listPath?.trim() ?? '', data);

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

	#processInterpolation<R, T>(propString: string, data?: T) {
		const [prop, ...filters] = propString?.split(this.#attributes.filterSeparator) ?? [];
		let resolvedValue = this.#getValue(prop ?? '', data) as R;

		if (filters.length) {
			for (const filter of filters) {
				const [filterName = '', ...filterArgs] = filter.trim().split(' ');
				const filterfunction = this.#filters[filterName];

				if (!filterfunction) {
					console.warn(`Missing filter function: ${filterName}`);
					continue;
				}

				resolvedValue = filterfunction(resolvedValue, ...filterArgs) as R;
			}
		}

		return resolvedValue;
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
				(_, matchValue) => this.#formatValue(this.#processInterpolation(matchValue, data))
			);
		}

		return normalizedAttributes;
	}

	async #processResponsiveImages(sourceImage: HTMLElement) {
		if (sourceImage.hasAttribute(this.#attributes.skipImageOptimization) || !sourceImage.getAttribute('src')) {
			return sourceImage;
		}

		const normalizedImage = sourceImage.clone() as HTMLElement;

		normalizedImage.removeAttribute(this.#attributes.skipImageOptimization);
		normalizedImage.removeAttribute(this.#attributes.imageQuality);
		normalizedImage.removeAttribute(this.#attributes.imageDensities);
		normalizedImage.removeAttribute(this.#attributes.imageWidths);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const src = normalizedImage.getAttribute('src')!;
		const quality = sourceImage.getAttribute(this.#attributes.imageQuality);
		const width = normalizedImage.getAttribute('width');
		const height = normalizedImage.getAttribute('height');
		const widths = sourceImage.getAttribute(this.#attributes.imageWidths)?.split(',').map((w) => Number.parseInt(w.trim()));
		const densities = sourceImage.getAttribute(this.#attributes.imageDensities)?.split(',').map((w) => Number.parseInt(w.trim()));

		const newSrc = (await this.#imageOptimizer.addImageToCache({
			src,
			quality: quality ? Number.parseInt(quality) : undefined,
			width: width ? Number.parseInt(width) : undefined,
			height: height ? Number.parseInt(height) : undefined,
			widths,
			densities
		})) ?? src;

		normalizedImage.setAttribute('src', newSrc);

		if (sourceImage.hasAttribute(this.#attributes.imageWidths)) {
			const srcSet = this.#imageOptimizer.getImageSourceSet(newSrc);

			normalizedImage.setAttribute('srcset', srcSet);
		}

		return normalizedImage;
	}

	// eslint-disable-next-line complexity
	async #processNodes<T>(nodes: Node[], data: T) {
		type MaybeNode = Node | undefined;
		const processedNodes: (MaybeNode | MaybeNode[])[] = [...nodes];

		for (const [index, node] of nodes.entries()) {
			if (node instanceof HTMLElement) {
				if (node.hasAttribute(this.#attributes.if)) {
					const shouldKeepElement = this.#checkConditionalAttribute(node, data);

					node.removeAttribute(this.#attributes.if);
					node.removeAttribute(this.#attributes.ifNot);

					if (!shouldKeepElement) {
						processedNodes[index] = undefined;
						continue;
					}
				}

				if (node.hasAttribute(this.#attributes.loop)) {
					processedNodes[index] = await this.#processLoop(node, data);
					continue;
				}

				const elementsToSkip = ['script', 'style'];
				if (elementsToSkip.includes(node.tagName.toLowerCase() ?? '')) {
					continue;
				}

				// TODO: attributes

				if (node.tagName?.toLowerCase() === 'link' && node.getAttribute('rel') === 'import') {
					processedNodes[index] = await this.#processImport(node, data);
					continue;
				}

				if (node.tagName?.toLowerCase() === 'img') {
					processedNodes[index] = await this.#processResponsiveImages(node);
					continue;
				}

				if (node.tagName?.includes('-')) {
					processedNodes[index] = await this.#processComponent(node, data);
					continue;
				}

				if (node.childNodes.length > 0) {
					node.childNodes = await this.#processNodes(node.childNodes, data);
				}

				continue;
			}

			if (node instanceof TextNode) {
				if (!node.textContent) {
					continue;
				}

				if (node.textContent.trim().length === 0) {
					continue;
				}

				if (node.textContent.toUpperCase().includes('<!DOCTYPE')) {
					continue;
				}

				const { openDelimiter, closeDelimiter, unescapedOpenDelimiter, unescapedCloseDelimiter } = this.#attributes;

				if (new RegExp(`${unescapedOpenDelimiter}(.+?)${unescapedCloseDelimiter}`, 'igu').test(node.rawText)) {
					const htmlText = node.rawText
						.replaceAll(/\s+/iug, ' ')
						.replaceAll(
							new RegExp(`${unescapedOpenDelimiter}(.+?)${unescapedCloseDelimiter}`, 'igu'),
							(_, matchValue) => this.#formatValue(this.#processInterpolation(matchValue, data))
						);

					const parsedElement = this.#parse(htmlText);

					processedNodes[index] = parsedElement;
				} else if (new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu').test(node.textContent)) {
					node.textContent = node.textContent
						.replaceAll(/\s+/iug, ' ')
						.replaceAll(
							new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu'),
							(_, matchValue) => this.#formatValue(this.#processInterpolation(matchValue, data))
						);
				}
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
		await this.#initTemplates();

		const response = await env.Assets.fetch(new URL(template, this.#TEMPLATES_URL));
		const text = await response.text();
		const parsedDocument = this.#parse(text);

		parsedDocument.childNodes = await this.#processNodes(parsedDocument.childNodes, data);

		return parsedDocument.outerHTML;
	}

	async renderString<T>(text: string, data?: T) {
		await this.#initTemplates();

		const parsedDocument = this.#parse(text);

		parsedDocument.childNodes = await this.#processNodes(parsedDocument.childNodes, data);

		return parsedDocument.outerHTML;
	}
}
