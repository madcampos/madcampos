export function escapeHtmlTags(input: string) {
	return input.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
}

export function inlineMarkdownRender(input: string) {
	const results = escapeHtmlTags(input)
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
