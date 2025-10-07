import type { MarkedExtension, Tokens } from 'marked';

interface HighlightToken extends Tokens.Generic {
	type: 'highlight';
	html: string;
	text: string;
}

function tokenizer(src: string) {
	const rule = /^[=]=(?<text>[^=]*?)==/iu;
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
}

function start(src: string) {
	return src.indexOf('==');
}

export const extension: MarkedExtension = {
	extensions: [{
		name: 'highlight',
		level: 'inline',
		start,
		tokenizer,
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

export const stripExtension: MarkedExtension = {
	extensions: [{
		name: 'strip-highlight',
		level: 'inline',
		start,
		tokenizer,
		// @ts-expect-error
		renderer: (token: HighlightToken) => token.text
	}]
};
