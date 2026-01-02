export const settings = {
	rel: ['external', 'noopener', 'noreferrer'],
	referrerpolicy: 'no-referrer',
	contentProperties: { 'data-external-link': '' },
	content: [
		{
			type: 'element',
			tagName: 'sr-only',
			properties: {},
			children: [{ type: 'text', value: '(External link)' }]
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
					properties: { href: '#mingcute--external-link-line' },
					children: []
				}]
			}]
		}
	]
};
