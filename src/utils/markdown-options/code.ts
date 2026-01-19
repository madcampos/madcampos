import type { Element as HastElement, Root as HastRoot } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypePlugin() {
	return function walkTree(tree: HastRoot) {
		visit(tree, 'element', (node, _, parentNode) => {
			if (node.tagName === 'pre' && (parentNode as HastElement)?.tagName !== 'code-wrapper') {
				const children = [...node.children ?? []];
				const properties = Object.fromEntries(Object.entries(node.properties ?? {}).filter(([key]) => key !== 'tabindex'));

				node.tagName = 'code-wrapper';
				node.properties = {
					role: 'region',
					tabindex: '0'
				};
				node.children = [{
					type: 'element',
					tagName: 'pre',
					properties,
					children
				}];
			}
		});
	};
}
