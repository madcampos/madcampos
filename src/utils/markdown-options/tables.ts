import type { Element as HastElement, Root as HastRoot } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypePlugin() {
	// eslint-disable-next-line func-names
	return function(tree: HastRoot) {
		visit(tree, 'element', (node, _, parentNode) => {
			if (node.tagName === 'table' && (parentNode as HastElement)?.tagName !== 'table-wrapper') {
				const children = [...node.children ?? []];

				node.tagName = 'table-wrapper';
				node.properties = {
					role: 'region',
					tabindex: '0'
				};
				node.children = [{
					type: 'element',
					tagName: 'table',
					properties: {},
					children
				}];
			}
		});
	};
}
