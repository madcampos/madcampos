/* eslint-disable max-lines */
// eslint-disable-next-line @typescript-eslint/no-shadow
import { type HTMLElement, NodeType, parse } from 'node-html-parser';
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
type ComponentFunction = (data: any) => Promise<string> | string;
type ComponentReferenceList = Record<string, ComponentFunction | string>;

interface RenderTemplateParams<T> {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	template: string;
	data?: T;
}

interface RenderStringParams<T> {
	assets: Env['Assets'];
	imageOptimizer: ImageOptimizer;
	text: string;
	data?: T;
}

/**
 * The special attributes to do if checks, loops, etc.
 */
interface TemplateRenderingAttributes {
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
	 * If not predent, the default quality will be used.
	 * @default '@quality'
	 */
	imageQuality: string;

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
}

export interface TemplateRendererOptions {
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
		openDelimiter: '\\{\\{',
		closeDelimiter: '\\}\\}',
		unescapedOpenDelimiter: '\\{\\{\\{',
		unescapedCloseDelimiter: '\\}\\}\\}'
	};
	#componentCache: ComponentReferenceList = {};
	#isIndexFetched = false;
	#componentPaths: ComponentReferenceList;

	constructor({ components, componentIndex, templatesFolder, attributes }: TemplateRendererOptions = {}) {
		this.#componentPaths = Object.fromEntries(Object.entries(components ?? {}).map(([key, value]) => [key.toLowerCase(), value]));

		this.#TEMPLATES_URL = new URL(templatesFolder ?? '_templates/', 'https://assets.local/');
		this.#COMPONENTS_INDEX_URL = new URL(componentIndex ?? 'components/index.json', this.#TEMPLATES_URL);

		this.#attributes = {
			...this.#attributes,
			...(attributes ?? {})
		};
	}

	get templatesPath() {
		return this.#TEMPLATES_URL.pathname;
	}

	async #initTemplates(assets: Env['Assets']) {
		if (!this.#isIndexFetched) {
			try {
				const response = await assets.fetch(this.#COMPONENTS_INDEX_URL);

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

	#getValue<T>(path: string, data?: T) {
		if (!path) {
			throw new Error('Missing property path!');
		}

		if (!data) {
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

		if (result === null || result === undefined) {
			console.warn(`Missing data for property "${firstPart}"`);
			return undefined;
		}

		while (pathPartIndex < pathParts.length && result) {
			const pathPart = pathParts[pathPartIndex];

			if (result?.[pathPart]) {
				result = result[pathPart];
			} else {
				console.warn(`Missing data for property "${firstPart}.${pathParts.slice(0, pathPartIndex + 1).join('.')}"`);
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

	async #getComponentText(assets: Env['Assets'], elementTag: string) {
		if (!this.#componentPaths[elementTag]) {
			return;
		}

		if (!this.#componentCache[elementTag]) {
			if (typeof this.#componentPaths[elementTag] === 'string') {
				const templatePath = this.#componentPaths[elementTag];
				const response = await assets.fetch(new URL(templatePath, this.#TEMPLATES_URL));

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

	async #processComponent(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element?: HTMLElement) {
		if (!element) {
			return;
		}

		for (const childElement of element.children) {
			try {
				if (childElement?.tagName?.toLowerCase().includes('-')) {
					let componentTextOrFunction = await this.#getComponentText(assets, childElement.tagName.toLowerCase());

					if (!componentTextOrFunction) {
						return;
					}

					if (typeof componentTextOrFunction === 'function') {
						componentTextOrFunction = await componentTextOrFunction(childElement.attributes);
					}

					if (childElement.hasAttribute(this.#attributes.skipShadowDom)) {
						childElement.insertAdjacentHTML('afterbegin', componentTextOrFunction);
						childElement.removeAttribute(this.#attributes.skipShadowDom);
					} else {
						childElement.insertAdjacentHTML('afterbegin', `<template shadowrootmode="open">${componentTextOrFunction}</template>`);
					}

					if (!childElement.hasAttribute(this.#attributes.skipProcessing)) {
						await this.#processElement(assets, imageOptimizer, childElement, childElement.attributes);
					} else {
						childElement.removeAttribute(this.#attributes.skipProcessing);
					}
				}
			} catch (err) {
				console.error(err);
			}
		}
	}

	async #processIfAttribute<T>(element?: HTMLElement, data?: T) {
		if (!element) {
			return Promise.resolve();
		}

		if (element.hasAttribute(this.#attributes.if)) {
			const value = this.#getValue(element.getAttribute(this.#attributes.if) ?? '', data);

			const falsyValues = ['', false, null, undefined] as const;
			if (falsyValues.includes(value) || Number.isNaN(value)) {
				element.remove();
			} else {
				element.removeAttribute(this.#attributes.if);
			}
		}

		if (element.hasAttribute(this.#attributes.ifNot)) {
			const value = this.#getValue(element.getAttribute(this.#attributes.ifNot) ?? '', data);

			const falsyValues = ['', false, null, undefined] as const;
			if (falsyValues.includes(value) || Number.isNaN(value)) {
				element.removeAttribute(this.#attributes.ifNot);
			} else {
				element.remove();
			}
		}
	}

	async #processImport<T>(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element?: HTMLElement, data?: T) {
		if (!element) {
			return;
		}

		if (element.tagName?.toLowerCase() === 'link' && element.getAttribute('rel') === 'import') {
			const filePath = element.getAttribute('href');

			if (!filePath) {
				console.warn('Missing import file!');
			} else {
				let importData;

				if (element.hasAttribute(this.#attributes.importData)) {
					importData = this.#getValue(element.getAttribute(this.#attributes.importData) ?? '', data);

					element.removeAttribute(this.#attributes.importData);
				}

				const importedTemplate = await this.renderTemplate({
					assets,
					imageOptimizer,
					template: filePath,
					data: { ...element.attributes, ...(importData ?? {}) }
				});

				element.insertAdjacentHTML('afterend', importedTemplate);
				element.remove();
			}
		}
	}

	async #processChildElements<T>(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element?: HTMLElement, data?: T) {
		if (!element) {
			return;
		}

		for (const childElement of element.children) {
			try {
				const elementsToSkip = ['script', 'style'];
				if (elementsToSkip.includes(childElement?.tagName?.toLowerCase() ?? '')) {
					continue;
				}

				await this.#processElement(assets, imageOptimizer, childElement, data);
			} catch (err) {
				console.error(err);
			}
		}
	}

	async #processLoop<T>(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element?: HTMLElement, data?: T) {
		if (!element) {
			return;
		}

		if (element.hasAttribute(this.#attributes.loop)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const [itemName, listPath] = element.getAttribute(this.#attributes.loop)!.split(this.#attributes.loopOperator);
			let list = this.#getValue(listPath?.trim() ?? '', data);

			if (typeof list === 'string') {
				list = [...list];
			}

			if (!list) {
				element.remove();
				throw new Error(`Missing list "${(listPath ?? '').trim()}" for loop on element "${element.tagName?.toLowerCase()}"`);
			} else if (!itemName) {
				element.remove();
				throw new Error(`Missing list item name for loop on element "${element.tagName.toLowerCase()}"`);
			} else {
				for (const itemValue of list) {
					try {
						const clonedElement = element.clone() as HTMLElement;

						clonedElement.removeAttribute(this.#attributes.loop);

						await this.#processElement(assets, imageOptimizer, clonedElement, {
							...(data ?? {}),
							[itemName?.trim() ?? '']: itemValue
						});

						element.before(clonedElement);
					} catch (err) {
						console.error(err);
					}
				}
			}

			element.remove();
		}
	}

	async #processAttributes<T>(element?: HTMLElement, data?: T) {
		if (!element) {
			return Promise.resolve();
		}

		if (element.hasAttribute(this.#attributes.if) || element.hasAttribute(this.#attributes.ifNot) || element.hasAttribute(this.#attributes.loop)) {
			return Promise.resolve();
		}

		const { openDelimiter, closeDelimiter } = this.#attributes;

		Object.entries(element.attributes)
			.filter(([, value]) => new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu').test(value))
			.forEach(([attr, value]) => {
				const resolvedValue = value.replaceAll(
					new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu'),
					(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
				);

				element.setAttribute(attr, resolvedValue);
			});
	}

	async #processTextNodes<T>(element?: HTMLElement, data?: T) {
		if (!element) {
			return Promise.resolve();
		}

		if (element.hasAttribute(this.#attributes.if) || element.hasAttribute(this.#attributes.ifNot) || element.hasAttribute(this.#attributes.loop)) {
			return Promise.resolve();
		}

		element.childNodes.forEach((node) => {
			if (node.nodeType !== NodeType.TEXT_NODE) {
				return;
			}

			if (node.textContent.trim().length === 0) {
				return;
			}

			if (node.textContent.toUpperCase().includes('<!DOCTYPE')) {
				return;
			}

			const { openDelimiter, closeDelimiter, unescapedOpenDelimiter, unescapedCloseDelimiter } = this.#attributes;

			if (new RegExp(`${unescapedOpenDelimiter}(.+?)${unescapedCloseDelimiter}`, 'igu').test(node.rawText)) {
				node.rawText = node.rawText
					.replaceAll(/\s+/iug, ' ')
					.replaceAll(
						new RegExp(`${unescapedOpenDelimiter}(.+?)${unescapedCloseDelimiter}`, 'igu'),
						(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
					);
			} else {
				node.textContent = node.textContent
					.replaceAll(/\s+/iug, ' ')
					.replaceAll(
						new RegExp(`${openDelimiter}(.+?)${closeDelimiter}`, 'igu'),
						(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
					);
			}
		});
	}

	async #processResponsiveImages(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element: HTMLElement) {
		if (element.tagName?.toLowerCase() !== 'img') {
			return;
		}

		if (element.getAttribute('src')) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const src = element.getAttribute('src')!;
			const quality = element.getAttribute(this.#attributes.imageQuality);
			const width = element.getAttribute('width');
			const height = element.getAttribute('height');

			const newSrc = (await imageOptimizer.addImageToCache(assets, {
				src,
				quality: quality ? Number.parseInt(quality) : undefined,
				width: width ? Number.parseInt(width) : undefined,
				height: height ? Number.parseInt(height) : undefined
			})) ?? src;

			element.setAttribute('src', newSrc);
		}

		// TODO: handle srcset and multiple images
	}

	async #processElement<T>(assets: Env['Assets'], imageOptimizer: ImageOptimizer, element: HTMLElement, data?: T) {
		await this.#processIfAttribute(element, data);
		await this.#processImport(assets, imageOptimizer, element, data);
		await this.#processLoop(assets, imageOptimizer, element, data);
		await this.#processChildElements(assets, imageOptimizer, element, data);
		await this.#processAttributes(element, data);
		await this.#processResponsiveImages(assets, imageOptimizer, element);
		await this.#processTextNodes(element, data);
		await this.#processComponent(assets, imageOptimizer, element);
	}

	/**
	 * Renders the given template path using the provided data.
	 *
	 * It returns a string of the rendered HTML.
	 */
	async renderTemplate<T>({ assets, template, imageOptimizer, data }: RenderTemplateParams<T>) {
		await this.#initTemplates(assets);

		const response = await assets.fetch(new URL(template, this.#TEMPLATES_URL));
		const text = await response.text();
		const parsedDocument = parse(text, {
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

		await this.#processElement(assets, imageOptimizer, parsedDocument, data);

		return parsedDocument.outerHTML;
	}

	async renderString<T>({ assets, text, imageOptimizer, data }: RenderStringParams<T>) {
		await this.#initTemplates(assets);

		const parsedDocument = parse(text, {
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

		await this.#processElement(assets, imageOptimizer, parsedDocument, data);

		return parsedDocument.outerHTML;
	}
}
