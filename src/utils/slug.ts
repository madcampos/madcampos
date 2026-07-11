export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s_-]/gu, '')
		.replace(/\s+/gu, '-')
		.replace(/-+/gu, '-')
		.replace(/^-+|-+$/gu, '');
}
