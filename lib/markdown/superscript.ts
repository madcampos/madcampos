import type { MarkedExtension, Tokens } from 'marked';

interface SuperscriptToken extends Tokens.Generic {
	type: 'superscript';
	html: string;
	text: string;
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'superscript',
		level: 'inline',
		start: (src) => src.indexOf('~'),
		tokenizer: (src) => {
			const rule = /\^(?!\^)(?<text>[^^]*?)\^(?!\^)/iu;
			const match = rule.exec(src);

			if (!match) {
				return;
			}

			return {
				type: 'superscript',
				raw: match[0],
				text: match.groups?.['text'],
				html: ''
			};
		},
		renderer: (token: Tokens.Generic & { html?: string }) => token.html
	}],
	async: true,
	// @ts-expect-error
	walkTokens: (token: SuperscriptToken) => {
		if (token.type !== 'superscript') {
			return;
		}

		token.html = `<sup>${token.text}</sup>`;
	}
};
