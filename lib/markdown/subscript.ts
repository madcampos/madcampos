import type { MarkedExtension, Tokens } from 'marked';

interface SubscriptToken extends Tokens.Generic {
	type: 'subscript';
	html: string;
	text: string;
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'subscript',
		level: 'inline',
		start: (src) => src.indexOf('~'),
		tokenizer: (src) => {
			const rule = /~(?!~)(?<text>[^~]*?)~(?!~)/iu;
			const match = rule.exec(src);

			if (!match) {
				return;
			}

			return {
				type: 'subscript',
				raw: match[0],
				text: match.groups?.['text'],
				html: ''
			};
		},
		renderer: (token: Tokens.Generic & { html?: string }) => token.html
	}],
	async: true,
	// @ts-expect-error
	walkTokens: (token: SubscriptToken) => {
		if (token.type !== 'subscript') {
			return;
		}

		token.html = `<sub>${token.text}</sub>`;
	}
};
