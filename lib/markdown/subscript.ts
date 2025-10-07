import type { MarkedExtension, Tokens } from 'marked';

interface SubscriptToken extends Tokens.Generic {
	type: 'subscript';
	html: string;
	text: string;
}

function tokenizer(src: string) {
	const rule = /^~(?!~)(?<text>[^~]*?)~(?!~)/iu;
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
}

function start(src: string) {
	return src.indexOf('~');
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'subscript',
		level: 'inline',
		start,
		tokenizer,
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

export const stripExtension: MarkedExtension = {
	extensions: [{
		name: 'strip-subscript',
		level: 'inline',
		start,
		tokenizer,
		// @ts-expect-error
		renderer: (token: SubscriptToken) => token.text
	}]
};
