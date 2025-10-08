import type { BaseElementHandler } from './BaseHandler.ts';
import { ValueHandler } from './ValueHandler.ts';

/**
 * Handle
 */
export class ConditionHandler<T> implements HTMLRewriterElementContentHandlers, BaseElementHandler {
	/**
	 * The attribute used for if checks.
	 */
	static ifAttribute = '@if';

	/**
	 * The attribute used for negative checks (_"if not x"_).
	 */
	static elseAttribute = '@else';

	static readonly selector = `[${ConditionHandler.ifAttribute}], [${ConditionHandler.elseAttribute}]`;

	#data: T;

	constructor(data: T) {
		this.#data = data;
	}

	element(element: Element) {
		// TODO: handle next element to have "else"
		// TODO: handle loose "else"
		if (element.hasAttribute(ConditionHandler.ifAttribute)) {
			const value = ValueHandler.getValue(element.getAttribute(ConditionHandler.ifAttribute) ?? '', this.#data, false);

			const falsyValues = ['', false, null, undefined] as const;
			if (falsyValues.includes(value) || Number.isNaN(value)) {
				element.remove();
			}
		}

		if (element.hasAttribute(ConditionHandler.elseAttribute)) {
			const value = ValueHandler.getValue(element.getAttribute(ConditionHandler.elseAttribute) ?? '', this.#data, false);

			const falsyValues = ['', false, null, undefined] as const;
			if (!falsyValues.includes(value) && !Number.isNaN(value)) {
				element.remove();
			}
		}
	}
}
