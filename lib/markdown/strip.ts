import type { MarkedExtension } from 'marked';

export const extension: MarkedExtension = {
	renderer: {
		space: () => ' ',
		code: (token) => token.text,
		blockquote: (token) => token.text,
		html: (token) => token.text,
		heading: (token) => token.text,
		hr: () => '',
		list: (token) => token.items.map((item) => item.text).join(),
		listitem: (token) => token.text,
		checkbox: (token) => `[${token.checked ? 'x' : ' '}]`,
		paragraph: (token) => token.text,
		table: (token) => token.raw,
		tablerow: (token) => token.text,
		tablecell: (token) => token.text,
		strong: (token) => token.text,
		em: (token) => token.text,
		codespan: (token) => token.text,
		br: () => '\n',
		del: (token) => token.text,
		link: (token) => token.text,
		image: (token) => token.text,
		text: (token) => token.text
	}
};
