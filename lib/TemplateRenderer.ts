// eslint-disable-next-line @typescript-eslint/no-shadow
import { type HTMLElement, NodeType, parse } from 'node-html-parser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentFunction = (data: any) => Promise<string> | string;
export type ComponentReferenceList = Record<string, ComponentFunction | string>;

interface InitParameters {
	components?: ComponentReferenceList;
}

export class TemplateRenderer {
	#TEMPLATES_FOLDER = 'templates';
	#IF_ATTRIBUTE = '@if';
	#LOOP_ATTRIBUTE = '@for';
	#SKIP_PROCESSING_ATTRIBUTE = '@no-process';
	#SKIP_SHADOWDOM_ATTRIBUTE = '@no-shadowdom';
	#LOOP_OPERATOR = 'in';
	#OPEN_DELIMITER = '\\{\\{';
	#CLOSE_DELIMITER = '\\}\\}';

	#componentCache: ComponentReferenceList = {};
	#componentPaths: ComponentReferenceList;

	constructor({ components }: InitParameters = {}) {
		this.#componentPaths = Object.fromEntries(Object.entries(components ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
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
				const response = await assets.fetch(`https://assets.local/${this.#TEMPLATES_FOLDER}/${templatePath}`);

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

					if (childElement.hasAttribute(this.#SKIP_SHADOWDOM_ATTRIBUTE)) {
						childElement.insertAdjacentHTML('afterbegin', componentTextOrFunction);
						childElement.removeAttribute(this.#SKIP_SHADOWDOM_ATTRIBUTE);
					} else {
						childElement.insertAdjacentHTML('afterbegin', `<template shadowrootmode="open">${componentTextOrFunction}</template>`);
					}

					if (!childElement.hasAttribute(this.#SKIP_PROCESSING_ATTRIBUTE)) {
						await this.#processElement(assets, childElement, childElement.attributes);
					} else {
						childElement.removeAttribute(this.#SKIP_PROCESSING_ATTRIBUTE);
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

		if (element.hasAttribute(this.#IF_ATTRIBUTE)) {
			const value = this.#getValue(element.getAttribute(this.#IF_ATTRIBUTE) ?? '', data);

			const falsyValues = ['', false, null, undefined] as const;
			if (falsyValues.includes(value) || Number.isNaN(value)) {
				element.remove();
			} else {
				element.removeAttribute(this.#IF_ATTRIBUTE);
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

				if (element.hasAttribute('data')) {
					importData = this.#getValue(element.getAttribute('data') ?? '', data);
				}

				const importedTemplate = await this.renderTemplate(assets, filePath, importData);

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

		if (element.hasAttribute(this.#LOOP_ATTRIBUTE)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const [itemName, listPath] = element.getAttribute(this.#LOOP_ATTRIBUTE)!.split(this.#LOOP_OPERATOR);
			const list = this.#getValue(listPath?.trim() ?? '', data);

			if (!list) {
				throw new Error(`Missing list "${(listPath ?? '').trim()}" for loop on element "${element.tagName?.toLowerCase()}"`);
			} else if (!itemName) {
				throw new Error(`Missing list item name for loop on element "${element.tagName.toLowerCase()}"`);
			} else {
				for (const itemValue of list) {
					try {
						const clonedElement = element.clone() as HTMLElement;

						clonedElement.removeAttribute(this.#LOOP_ATTRIBUTE);

						await this.#processElement(assets, clonedElement, {
							...(data ?? {}),
							[itemName?.trim() ?? '']: itemValue
						});

						element.after(clonedElement);
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

		if (element.hasAttribute(this.#IF_ATTRIBUTE) || element.hasAttribute(this.#LOOP_ATTRIBUTE)) {
			return Promise.resolve();
		}

		Object.entries(element.attributes)
			.filter(([, value]) => new RegExp(`${this.#OPEN_DELIMITER}(.+?)${this.#CLOSE_DELIMITER}`, 'igu').test(value))
			.forEach(([attr, value]) => {
				const resolvedValue = value.replaceAll(
					new RegExp(`${this.#OPEN_DELIMITER}(.+?)${this.#CLOSE_DELIMITER}`, 'igu'),
					(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
				);

				element.setAttribute(attr, resolvedValue);
			});
	}

	async #processTextNodes<T>(element?: HTMLElement, data?: T) {
		if (!element) {
			return Promise.resolve();
		}

		if (element.hasAttribute(this.#IF_ATTRIBUTE) || element.hasAttribute(this.#LOOP_ATTRIBUTE)) {
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

			node.textContent = node.textContent
				.replaceAll('\n', ' ')
				.trim()
				.replaceAll(
					new RegExp(`${this.#OPEN_DELIMITER}(.+?)${this.#CLOSE_DELIMITER}`, 'igu'),
					(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
				);
		});
	}

	async #processElement<T>(assets: Env['Assets'], element: HTMLElement, data?: T) {
		await this.#processIfAttribute(element, data);
		await this.#processImport(assets, element, data);
		await this.#processLoop(assets, element, data);
		await this.#processChildElements(assets, element, data);
		await this.#processAttributes(element, data);
		await this.#processTextNodes(element, data);
		await this.#processComponent(assets, element);
	}

	async renderTemplate<T>(assets: Env['Assets'], templatePath: string, data?: T) {
		const response = await assets.fetch(`https://assets.local/${this.#TEMPLATES_FOLDER}/${templatePath}`);
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
