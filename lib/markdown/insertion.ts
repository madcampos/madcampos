import type { MarkedExtension, Tokens } from 'marked';

interface InsertionToken extends Tokens.Generic {
	type: 'insertion';
	html: string;
	text: string;
}

function tokenizer(src: string) {
	const rule = /^\+\+(?<text>[^+]*?)\+\+/iu;
	const match = rule.exec(src);

	if (!match) {
		return;
	}

	return {
		type: 'insertion',
		raw: match[0],
		text: match.groups?.['text'],
		html: ''
	};
}

function start(src: string) {
	return src.indexOf('++');
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'insertion',
		level: 'inline',
		start,
		tokenizer,
		renderer: (token: Tokens.Generic & { html?: string }) => token.html
	}],
	async: true,
	// @ts-expect-error
	walkTokens: (token: InsertionToken) => {
		if (token.type !== 'insertion') {
			return;
		}

		token.html = `<ins>${token.text}</ins>`;
	}
};

export const stripExtension: MarkedExtension = {
	extensions: [{
		name: 'strip-insertion',
		level: 'inline',
		start,
		tokenizer,
		// @ts-expect-error
		renderer: (token: InsertionToken) => token.text
	}]
};
