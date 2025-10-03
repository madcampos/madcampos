import type { MarkedExtension, Tokens } from 'marked';

interface HighlightToken extends Tokens.Generic {
	type: 'highlight';
	html: string;
	text: string;
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'highlight',
		level: 'inline',
		start: (src) => src.indexOf('=='),
		tokenizer: (src) => {
			const rule = /[=]=(?<text>[^=]*?)==/iu;
			const match = rule.exec(src);

			if (!match) {
				return;
			}

			return {
				type: 'highlight',
				raw: match[0],
				text: match.groups?.['text'],
				html: ''
			};
		},
		renderer: (token: Tokens.Generic & { html?: string }) => token.html
	}],
	async: true,
	// @ts-expect-error
	walkTokens: (token: HighlightToken) => {
		if (token.type !== 'highlight') {
			return;
		}

		token.html = `<mark>${token.text}</mark>`;
	}
};
