export function escapeHtmlTags(input: string) {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
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
