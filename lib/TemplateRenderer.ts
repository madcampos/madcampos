// eslint-disable-next-line @typescript-eslint/no-shadow
import { type HTMLElement, NodeType, parse } from 'node-html-parser';

type ComponentFunction = <T>(data: T) => Promise<string> | string;
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
		this.#componentPaths = components ?? {};
	}

	#getValue<T>(path: string, data?: T) {
		if (!data) {
			return undefined;
		}

		const [firstPart, ...pathParts] = path.trim().split('.');

		if (!firstPart) {
			return undefined;
		}

		return pathParts.reduce(
			(result, pathPart) => {
				if (result?.[pathPart]) {
					return result[pathPart];
				}

				return result;
			},
			// @ts-expect-error
			data?.[firstPart]
		);
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
				const text = await response.text();

				this.#componentCache[elementTag] = text;
			} else {
				this.#componentCache[elementTag] = this.#componentPaths[elementTag];
			}
		}

		return this.#componentCache[elementTag];
	}

	async #processComponent(assets: Env['Assets'], element: HTMLElement) {
		let componentTextOrFunction = await this.#getComponentText(assets, element.tagName.toLowerCase());

		if (!componentTextOrFunction) {
			return;
		}

		if (typeof componentTextOrFunction === 'function') {
			componentTextOrFunction = await componentTextOrFunction(element.attributes);
		}

		if (element.hasAttribute(this.#SKIP_SHADOWDOM_ATTRIBUTE)) {
			element.insertAdjacentHTML('afterbegin', componentTextOrFunction);
			element.removeAttribute(this.#SKIP_SHADOWDOM_ATTRIBUTE);
		} else {
			element.insertAdjacentHTML('afterbegin', `<template shadowrootmode="open">${componentTextOrFunction}</template>`);
		}

		if (!element.hasAttribute(this.#SKIP_PROCESSING_ATTRIBUTE)) {
			await this.#processTree(assets, element, element.attributes);
		} else {
			element.removeAttribute(this.#SKIP_PROCESSING_ATTRIBUTE);
		}
	}

	async #processTree<T>(assets: Env['Assets'], element: HTMLElement, data?: T) {
		if (element.hasAttribute(this.#IF_ATTRIBUTE)) {
			const value = this.#getValue(element.getAttribute(this.#IF_ATTRIBUTE) ?? '', data);

			element.removeAttribute(this.#IF_ATTRIBUTE);

			if (!value) {
				element.remove();
				return;
			}
		}

		if (element?.tagName?.toLowerCase() === 'link' && element.getAttribute('rel') === 'import') {
			const filePath = element.getAttribute('href');
			const importData = this.#getValue(element.getAttribute('data') ?? '', data);

			if (filePath) {
				const importedTemplate = await this.renderTemplate(assets, filePath, importData);

				element.insertAdjacentHTML('afterend', importedTemplate);
				element.remove();
			}
		}

		if (element.hasAttribute(this.#LOOP_ATTRIBUTE)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const [itemName, listPath] = element.getAttribute(this.#LOOP_ATTRIBUTE)!.split(this.#LOOP_OPERATOR);
			const list = this.#getValue(listPath?.trim() ?? '', data);

			element.removeAttribute(this.#LOOP_ATTRIBUTE);

			const results = await Promise.all(list.map(async (itemValue: unknown) => {
				const clonedElement = element.clone() as HTMLElement;

				await this.#processTree(assets, clonedElement, {
					...(data ?? {}),
					[itemName?.trim() ?? '']: itemValue
				});

				return clonedElement;
			}));

			element.after(...results);
			element.remove();
		} else {
			await Promise.all(element.children.map(async (childElement) => {
				await this.#processTree(assets, childElement, data);
			}));
		}

		Object.entries(element.attributes).forEach(([attr, value]) => {
			const resolvedValue = value.replaceAll(
				new RegExp(`${this.#OPEN_DELIMITER}(.+?)${this.#CLOSE_DELIMITER}`, 'igu'),
				(_, matchValue) => this.#formatValue(this.#getValue(matchValue, data))
			);

			element.setAttribute(attr, resolvedValue);
		});

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

		if (element.tagName.toLowerCase().includes('-')) {
			await this.#processComponent(assets, element);
		}
	}

	async renderTemplate<T>(assets: Env['Assets'], templatePath: string, data?: T) {
		const response = await assets.fetch(`https://assets.local/${this.#TEMPLATES_FOLDER}/${templatePath}`);
		const text = await response.text();
		const parsedDocument = parse(text);

		await this.#processTree(assets, parsedDocument, data);

		return parsedDocument.outerHTML;
	}
}
