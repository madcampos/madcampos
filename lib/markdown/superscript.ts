import type { MarkedExtension, Tokens } from 'marked';

interface SuperscriptToken extends Tokens.Generic {
	type: 'superscript';
	html: string;
	text: string;
}

function tokenizer(src: string) {
	const rule = /^\^(?!\^)(?<text>[^^]*?)\^(?!\^)/iu;
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
}

function start(src: string) {
	return src.indexOf('^');
}
export const extension: MarkedExtension = {
	extensions: [{
		name: 'superscript',
		level: 'inline',
		start,
		tokenizer,
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

export const stripExtension: MarkedExtension = {
	extensions: [{
		name: 'strip-superscript',
		level: 'inline',
		start,
		tokenizer,
		// @ts-expect-error
		renderer: (token: SuperscriptToken) => token.text
	}]
};
