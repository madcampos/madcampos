// eslint-disable-next-line @typescript-eslint/no-shadow
import { type HTMLElement, NodeType, parse } from 'node-html-parser';

interface InitParameters {
	assets: Env['Assets'];
	components: Record<string, string>;
}

export class TemplateRendered {
	#IF_ATTRIBUTE = '@if';
	#LOOP_ATTRIBUTE = '@for';
	#LOOP_OPERATOR = 'in';
	#OPEN_DELIMITER = '\\{\\{';
	#CLOSE_DELIMITER = '\\}\\}';

	#componentCache: Record<string, string> = {};
	#componentPaths: Record<string, string>;

	#assets: Env['Assets'];

	constructor({ assets, components }: InitParameters) {
		this.#assets = assets;
		this.#componentPaths = components;
	}

	#getValue<T>(data: T, path: string) {
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
			data[firstPart]
		);
	}

	#formatValue(value?: unknown) {
		if (value === null || value === undefined) {
			return '';
		}

		if (['string', 'number', 'boolean', 'bigint', 'symbol'].includes(typeof value)) {
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
		if (this.#componentCache[elementTag] && this.#componentPaths[elementTag]) {
			const templatePath = this.#componentPaths[elementTag];
			const response = await this.#assets.fetch(`https://assets.local/templates/${templatePath}`);
			const text = await response.text();

			this.#componentCache[elementTag] = text;
		}

		return this.#componentCache[elementTag];
	}

	async #processComponent(element: HTMLElement) {
		const componentText = await this.#getComponentText(element.tagName);

		// TODO: add custom element support
		// 1. Process component based on attribute "@process"
		// 2. Set attributes as properties that can be referenced along with data.
		// 3.1. Simple copy of contents inside template with declarative shadowdom.
		// 3.2. List slots and find out where to put child elements in slots.
	}

	async #processTree<T>(element: HTMLElement, data?: T) {
		if (element.hasAttribute(this.#IF_ATTRIBUTE)) {
			const value = this.#getValue(data, element.getAttribute(this.#IF_ATTRIBUTE) ?? '');

			element.removeAttribute(this.#IF_ATTRIBUTE);

			if (!value) {
				element.remove();
				return;
			}
		}

		if (element?.tagName?.toLowerCase() === 'link' && element.getAttribute('rel') === 'import') {
			const filePath = element.getAttribute('href');
			const importData = this.#getValue(data, element.getAttribute('data') ?? '');

			if (filePath) {
				const importedTemplate = await this.#renderTemplate(filePath, importData);

				element.insertAdjacentHTML('afterend', importedTemplate);
				element.remove();
			}
		}

		if (element.hasAttribute(this.#LOOP_ATTRIBUTE)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const [itemName, listPath] = element.getAttribute(this.#LOOP_ATTRIBUTE)!.split(this.#LOOP_OPERATOR);
			const list = this.#getValue(data, listPath?.trim() ?? '');

			element.removeAttribute(this.#LOOP_ATTRIBUTE);

			const results = await Promise.all(list.map(async (itemValue: unknown) => {
				const clonedElement = element.clone() as HTMLElement;

				await this.#processTree(clonedElement, {
					...(data ?? {}),
					[itemName?.trim() ?? '']: itemValue
				});

				return clonedElement;
			}));

			element.after(...results);
			element.remove();
		} else {
			await Promise.all(element.children.map(async (childElement) => {
				await this.#processTree(childElement, data);
			}));
		}

		Object.entries(element.attributes).forEach(([attr, value]) => {
			const resolvedValue = value.replaceAll(
				new RegExp(`${this.#OPEN_DELIMITER}(.+?)${this.#CLOSE_DELIMITER}`, 'igu'),
				(_, matchValue) => this.#formatValue(this.#getValue(data, matchValue))
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
					(_, matchValue) => this.#formatValue(this.#getValue(data, matchValue))
				);
		});

		if (element.tagName.toLowerCase().includes('-')) {
			await this.#processComponent(element);
		}
	}

	async #renderTemplate<T>(templatePath: string, data?: T) {
		const response = await this.#assets.fetch(`https://assets.local/templates/${templatePath}`);
		const text = await response.text();
		const parsedDocument = parse(text);

		await this.#processTree(parsedDocument, data);

		return parsedDocument.outerHTML;
	}
}
