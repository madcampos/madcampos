import type { ElementContent } from 'hast';
import type { Root } from 'mdast';
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive';
import { visit } from 'unist-util-visit';
import { features } from 'web-features';
import { render as renderBaseline } from '../components/Baseline/Baseline.ts';
import { render as renderCodepen } from '../components/CodepenEmbed/CodepenEmbed.ts';
import { render as renderYoutube } from '../components/YoutubeEmbed/YoutubeEmbed.ts';

interface VFile {
	fail(reason: string, parentNode?: unknown): void;
}

type AllowedContainerTypes<T extends {} = {}> = T & (ContainerDirective | LeafDirective | TextDirective);

function testDirectiveType(node: { type: string, name?: string }, directiveName: string): asserts node is AllowedContainerTypes {
	const allowedDirectives = ['containerDirective', 'leafDirective', 'textDirective'];

	if (!allowedDirectives.includes(node.type)) {
		throw new Error('Invalid directive type');
	}

	if (node?.name !== directiveName) {
		throw new Error('Invalid directive name');
	}
}

function validateDirectiveType(file: VFile, node: AllowedContainerTypes, directiveType: 'container' | 'leaf' | 'text', directiveName: string) {
	// eslint-disable-next-line no-nested-ternary
	const colonNumber = directiveType === 'container' ? 'three' : directiveType === 'leaf' ? 'two' : 'one';
	const actualDirectiveType = node.type.replace('Directive', '');

	if (directiveType !== actualDirectiveType) {
		file.fail(`Unexpected ${actualDirectiveType} directive for "${directiveName}", use ${colonNumber} colons for a ${directiveType} directive.`, node);
	}
}

function validateDirectiveProperties<T extends string[]>(
	file: VFile,
	node: AllowedContainerTypes,
	expectedProperties: T
): asserts node is AllowedContainerTypes<{ attributes: Record<T[number], string> }> {
	const errors = expectedProperties.reduce<string[]>((errorList, property) => {
		if (!node.attributes?.[property]) {
			errorList.push(`Missing "${property}"${property === 'id' ? ' ("#")' : ''} on "${node.name}" directive`);
		}

		return errorList;
	}, []);

	if (errors.length > 0) {
		file.fail(`Property validation failed:\n${errors.join('\n')}`);
	}
}

function buildElement<T extends HTMLElement>(node: AllowedContainerTypes, tagName: string, attributes: Partial<T>, children?: ElementContent[]) {
	node.data ??= {};

	node.data.hName = tagName;
	node.data.hProperties = {
		...node.data.hProperties,
		...attributes
	};
	node.data.hChildren = children;
}

export function codepenEmbed() {
	return (tree: Root, file: VFile) => {
		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'codepen');
				validateDirectiveType(file, node, 'leaf', 'codepen');
				validateDirectiveProperties(file, node, ['id', 'username']);

				const { id = '', username = '' } = node.attributes;
				const title = node.children.map((child: { value?: string }) => child?.value ?? '').join(' ');

				buildElement<HTMLElement>(node, 'codepen-embed', {}, [{
					type: 'raw',
					value: renderCodepen({ id, username, title })
				}]);
			} catch {
				// Ignore node
			}
		});
	};
}

export function youtubeEmbed() {
	return (tree: Root, file: VFile) => {
		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'youtube');
				validateDirectiveType(file, node, 'leaf', 'youtube');
				validateDirectiveProperties(file, node, ['id']);

				const { id = '' } = node.attributes;

				const title = node.children.map((child: { value?: string }) => child?.value ?? '').join(' ');

				buildElement<HTMLElement>(node, 'youtube-embed', {}, [{
					type: 'raw',
					value: renderYoutube({ id, title })
				}]);
			} catch {
				// Ignore node
			}
		});
	};
}

export function baselineInfo() {
	return (tree: Root, file: VFile) => {
		visit(tree, (node) => {
			try {
				testDirectiveType(node, 'baseline');
				validateDirectiveType(file, node, 'leaf', 'baseline');
				validateDirectiveProperties(file, node, ['id']);

				const { id = '' } = node.attributes;

				buildElement<HTMLElement & { feature: string, discouraged: string }>(node, 'baseline-support', {
					feature: id,
					discouraged: Boolean(features[id]?.discouraged ?? true).toString()
				}, [{
					type: 'raw',
					value: renderBaseline(id, features[id])
				}]);
			} catch {
				// Ignore node
			}
		});
	};
}

export function inlineMarkdownRender(input: string) {
	const results = input
		// Bold
		.replaceAll(/\*\*(.+?)\*\*|__(.+?)__/igu, '<strong>$1$2</strong>')
		// Italics
		.replaceAll(/\*(.+?)\*|_(.+?)_/igu, '<em>$1$2</em>')
		// Striketrough (deleted text)
		.replaceAll(/~~(.+?)~~/igu, '<del>$1</del>')
		// Underline (inserted text)
		.replaceAll(/\+\+(.+?)\+\+/igu, '<ins>$1</ins>')
		// Highlight
		.replaceAll(/[=]=(.+?)==/igu, '<mark>$1</mark>')
		// Inline code
		.replaceAll(/`(.+?)`/igu, '<code>$1</code>')
		// Links
		.replaceAll(/\[(.*?)\]\((.*?)\)/igu, '<a href="$2">$1</a>');

	return results;
}

export function inlineMarkdownStrip(input: string) {
	const results = input
		// Bold
		.replaceAll(/\*\*(.+?)\*\*|__(.+?)__/igu, '$1$2')
		// Italics
		.replaceAll(/\*(.+?)\*|_(.+?)_/igu, '$1$2')
		// Striketrough (deleted text)
		.replaceAll(/~~(.+?)~~/igu, '$1')
		// Underline (inserted text)
		.replaceAll(/\+\+(.+?)\+\+/igu, '$1')
		// Highlight
		.replaceAll(/[=]=(.+?)==/igu, '$1')
		// Inline code
		.replaceAll(/`(.+?)`/igu, '$1')
		// Links
		.replaceAll(/\[(.*?)\]\((.*?)\)/igu, '$1');

	return results;
}

export function escapeHtmlTags(input: string) {
	return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
}
