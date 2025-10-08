import type { BaseElementHandler } from './BaseHandler.ts';
import { ValueHandler } from './ValueHandler.ts';

export class TextHandler<T> implements HTMLRewriterElementContentHandlers, BaseElementHandler {
	static readonly selector = '*';

	/**
	 * The open delimiter for interpolating data.
	 */
	static openDelimiter = '\\{\\{';

	/**
	 * The close delimiter for interpolating data.
	 */
	static closeDelimiter = '\\}\\}';

	/**
	 * The open delimiter for interpolating **unescaped** data.
	 */
	static unescapedOpenDelimiter = '\\{\\{\\{';

	/**
	 * The close delimiter for interpolating **unescaped** data.
	 */
	static unescapedCloseDelimiter = '\\}\\}\\}';

	#data: T;

	constructor(data: T) {
		this.#data = data;
	}

	text(element: Text) {
		if (!element.text) {
			return;
		}

		if (element.text.trim().length === 0) {
			return;
		}

		const unescapedRegex = new RegExp(`${TextHandler.unescapedOpenDelimiter}(.+?)${TextHandler.unescapedCloseDelimiter}`, 'igu');
		const escapedRegex = new RegExp(`${TextHandler.openDelimiter}(.+?)${TextHandler.closeDelimiter}`, 'igu');

		if (unescapedRegex.test(element.text)) {
			const htmlText = element.text
				.replaceAll(/\s+/iug, ' ')
				.replaceAll(
					new RegExp(unescapedRegex, 'igu'),
					(_, matchValue) => ValueHandler.formatValue(ValueHandler.processInterpolation(matchValue, this.#data))
				);

			// TODO: parse html text?
			element.replace(htmlText, { html: true });
		} else if (escapedRegex.test(element.text)) {
			const newText = element.text
				.replaceAll(/\s+/iug, ' ')
				.replaceAll(
					new RegExp(escapedRegex, 'igu'),
					(_, matchValue) => ValueHandler.formatValue(ValueHandler.processInterpolation(matchValue, this.#data))
				);

			element.replace(newText);
		}
	}
}
