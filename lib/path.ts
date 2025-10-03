/**
 * Returns the last portion of a path, optionally removing a provided extension.
 */
export function basename(path: string, ext?: string) {
	if (!path) {
		return '';
	}

	const normalizedPath = path.replace(/\/+$/iu, '');
	const idx = normalizedPath.lastIndexOf('/');
	let base = idx === -1 ? normalizedPath : normalizedPath.slice(idx + 1);

	if (ext && base.endsWith(ext)) {
		base = base.slice(0, -ext.length);
	}

	return base;
}

/**
 * Returns the directory name of a path.
 */
export function dirname(path: string) {
	if (!path) {
		return '.';
	}

	const normalizedPath = path.replace(/\/+$/iug, '');

	if (normalizedPath === '') {
		return '/';
	}

	const idx = normalizedPath.lastIndexOf('/');

	if (idx === -1) {
		return '.';
	}

	if (idx === 0) {
		return '/';
	}

	return normalizedPath.slice(0, idx);
}

/**
 * Returns the extension of the path, from the last '.' to end of string in the last portion of the path.
 */
export function extname(path: string) {
	if (!path) {
		return '';
	}

	const normalizedPath = path.replace(/\/+$/iu, '');
	const baseName = normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1);
	const lastDotPosition = baseName.lastIndexOf('.');

	if (lastDotPosition <= 0) {
		return '';
	}

	return baseName.slice(lastDotPosition);
}

/**
 * Joins all given path segments together using forward slashes, then normalizes the resulting path.
 */
export function join(...paths: string[]) {
	let joinedPath = paths
		.filter(Boolean)
		.join('/');

	joinedPath = joinedPath.replace(/\/+/giu, '/');

	if (joinedPath.length > 1 && joinedPath.endsWith('/')) {
		joinedPath = joinedPath.slice(0, -1);
	}

	return joinedPath || '/';
}
