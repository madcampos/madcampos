import type { Element as HastElement, Root as HastRoot } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypePlugin() {
	return function walkTree(tree: HastRoot) {
		visit(tree, 'element', (node, _, parentNode) => {
			if (node.tagName === 'img' && (parentNode as HastElement)?.tagName !== 'img-lightbox') {
				if (parentNode?.children.length !== 1) {
					return;
				}

				const children = [...node.children ?? []];
				const properties = { ...node.properties };

				node.tagName = 'img-lightbox';
				node.properties = {};
				node.children = [{
					type: 'element',
					tagName: 'img',
					properties,
					children
				}];
			}
		});
	};
}
