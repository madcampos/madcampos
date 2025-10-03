import type { MarkedExtension, Tokens } from 'marked';

interface ImageToken extends Tokens.Generic {
	type: 'imageOptimization';
	html: string;
	text: string;
	href: string;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export function init(assets: Env['Assets'], processImage: (assets: Env['Assets'], filePath: string, imagePath: string, altText: string) => Promise<string>, entryPath: string) {
	return {
		extensions: [{
			name: 'imageOptimization',
			level: 'block',
			start: (src: string) => src.indexOf('!['),
			tokenizer: (src: string) => {
				const rule = /!\[(?<alt>.+?)\]\((?<href>.+?)\)/iu;
				const match = rule.exec(src);

				if (!match) {
					return;
				}

				return {
					type: 'imageOptimization',
					raw: match[0],
					href: match.groups?.['href'] ?? '',
					text: match.groups?.['alt'] ?? '',
					html: ''
				} satisfies ImageToken;
			},
			renderer: (token: Tokens.Generic & { html?: string }) => token.html
		}],
		async: true,
		walkTokens: async (token: ImageToken) => {
			if (token.type !== 'imageOptimization') {
				return;
			}

			token.html = await processImage(assets, entryPath, token.href ?? '', token.text);
		}
	} as unknown as MarkedExtension;
}
