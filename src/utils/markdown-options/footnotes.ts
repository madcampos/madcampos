import type { RemarkRehype } from '@astrojs/markdown-remark';

const ASCII_OFFSET = 95;

export const settings: Partial<RemarkRehype> = {
	clobberPrefix: '',
	footnoteBackContent: (referenceIndex, rereferenceIndex) => {
		if (rereferenceIndex <= 1) {
			return [
				{
					type: 'element',
					tagName: 'sr-only',
					properties: {},
					children: [{ type: 'text', value: `Back to reference ${referenceIndex + 1}` }]
				},
				{
					type: 'element',
					tagName: 'sup',
					properties: {},
					children: [{
						type: 'element',
						tagName: 'svg',
						properties: {
							'aria-hidden': 'true',
							'role': 'presentation',
							'viewBox': '0 0 24 24',
							'width': '24',
							'height': '24'
						},
						children: [{
							type: 'element',
							tagName: 'use',
							properties: { width: '24', height: '24', href: '#footnote-icon-back' },
							children: []
						}]
					}]
				}
			];
		}

		return [{
			type: 'element',
			tagName: 'sr-only',
			properties: {},
			children: [{ type: 'text', value: `Back to reference ${referenceIndex + 1}` }]
		}, {
			type: 'element',
			tagName: 'sup',
			properties: {},
			children: [{ type: 'text', value: String.fromCharCode(ASCII_OFFSET + rereferenceIndex) }]
		}];
	},
	footnoteBackLabel: () => '',
	footnoteLabel: 'Footnotes',
	footnoteLabelProperties: {},
	footnoteLabelTagName: 'h2'
};
