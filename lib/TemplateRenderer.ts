/* eslint-disable max-lines */
// eslint-disable-next-line @typescript-eslint/no-shadow
import { type HTMLElement, NodeType, parse } from 'node-html-parser';

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

/**
 * Handles image transformation, includding fetching and saving external images.
 *
 * This function should return a string representing either the `src` or _**individual**_ `srcset` for the image.
 *
 * E.g.:
 *
 * - `src`: ({ src: '/test.jpg' }) => '/transformed.jpg'
 * - `srcset`: ({ src: '/test.jpg', width: 100 }) => '/transformed.jpg 100w'
 */
export type ImageHandlingFunction = (assets: Env['Assets'], imageData: {
	type: 'src' | 'srcset',
	src: string,
	dest: string,
	quality: number,
	width?: number,
	density?: number
}) => Promise<string> | string;

interface TemplateRendererOptions {
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
	 * The image handling function.
	 * @see {@link ImageHandlingFunction}
	 */
	imageHandling?: ImageHandlingFunction;
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
	 * The default quality for image optimizations.
	 */
	defaultImageQuality?: number;
}

export class TemplateRenderer {
	#templateFolder = '_templates';
	#defaultImageQuality = '75';
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
	#componentPaths: ComponentReferenceList;
	#imageHandling?: ImageHandlingFunction;

	constructor({ components, imageHandling, templatesFolder, attributes, defaultImageQuality }: TemplateRendererOptions = {}) {
		this.#componentPaths = Object.fromEntries(Object.entries(components ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
		this.#imageHandling = imageHandling;

		if (templatesFolder) {
			this.#templateFolder = templatesFolder;
		}

		if (typeof defaultImageQuality === 'number') {
			this.#defaultImageQuality = defaultImageQuality.toString();
		}

		this.#attributes = {
			...this.#attributes,
			...(attributes ?? {})
		};
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
				const response = await assets.fetch(`https://assets.local/${this.#templateFolder}/${templatePath}`);

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

	async #processComponent(assets: Env['Assets'], element?: HTMLElement) {
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
						await this.#processElement(assets, childElement, childElement.attributes);
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

	async #processImport<T>(assets: Env['Assets'], element?: HTMLElement, data?: T) {
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

				const importedTemplate = await this.renderTemplate(assets, filePath, { ...element.attributes, ...(importData ?? {}) });

				element.insertAdjacentHTML('afterend', importedTemplate);
				element.remove();
			}
		}
	}

	async #processChildElements<T>(assets: Env['Assets'], element?: HTMLElement, data?: T) {
		if (!element) {
			return;
		}

		for (const childElement of element.children) {
			try {
				const elementsToSkip = ['script', 'style'];
				if (elementsToSkip.includes(childElement?.tagName?.toLowerCase() ?? '')) {
					continue;
				}

				await this.#processElement(assets, childElement, data);
			} catch (err) {
				console.error(err);
			}
		}
	}

	async #processLoop<T>(assets: Env['Assets'], element?: HTMLElement, data?: T) {
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

						await this.#processElement(assets, clonedElement, {
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

	async #processResponsiveImages(assets: Env['Assets'], element: HTMLElement) {
		if (element.tagName?.toLowerCase() !== 'img') {
			return;
		}

		if (element.getAttribute('src')) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const src = element.getAttribute('src')!;
			const newSrc = (await this.#imageHandling?.(assets, {
				type: 'src',
				src,
				dest: src,
				quality: Number.parseInt(element.getAttribute(this.#attributes.imageQuality) ?? this.#defaultImageQuality),
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				width: element.hasAttribute('width') ? Number.parseInt(element.getAttribute('width')!) : undefined,
				density: 1
			})) ?? src;

			element.setAttribute('src', newSrc);
		}

		if (element.getAttribute('srcset')) {
			const newSrcset = await Promise.all(
				(element.getAttribute('srcset') ?? '')
					.split(',')
					.map(async (srcString) => {
						const [src = '', size = ''] = srcString.split(' ');
						const parsedSize = size.endsWith('w') ? Number.parseInt(size.replace('w', '')) : undefined;
						const parsedDensity = size.endsWith('x') ? Number.parseInt(size.replace('x', '')) : undefined;

						return (await this.#imageHandling?.(assets, {
							type: 'srcset',
							src: element.getAttribute('src') ?? '',
							dest: src.trim(),
							quality: Number.parseInt(element.getAttribute(this.#attributes.imageQuality) ?? this.#defaultImageQuality),
							width: parsedSize,
							density: parsedDensity
						})) ?? srcString;
					})
			);

			element.setAttribute('srcset', newSrcset.join(', '));
		}
	}

	async #processElement<T>(assets: Env['Assets'], element: HTMLElement, data?: T) {
		await this.#processIfAttribute(element, data);
		await this.#processImport(assets, element, data);
		await this.#processLoop(assets, element, data);
		await this.#processChildElements(assets, element, data);
		await this.#processAttributes(element, data);
		await this.#processResponsiveImages(assets, element);
		await this.#processTextNodes(element, data);
		await this.#processComponent(assets, element);
	}

	/**
	 * Renders the given template path using the provided data.
	 *
	 * It returns a string of the rendered HTML.
	 */
	async renderTemplate<T>(assets: Env['Assets'], templatePath: string, data?: T) {
		const response = await assets.fetch(`https://assets.local/${this.#templateFolder}/${templatePath}`);
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

		await this.#processElement(assets, parsedDocument, data);

		return parsedDocument.outerHTML;
	}
}
