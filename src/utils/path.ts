interface JoinOptions {
	trailingSlash: boolean | undefined;
	separator: '/' | '\\';
}

const DEFAULT_TRAILING_SLASHES = true;

export function join(paths: string[], options?: Partial<JoinOptions>) {
	const opts: JoinOptions = {
		trailingSlash: DEFAULT_TRAILING_SLASHES,
		separator: '/',
		...options
	};

	// Matches two or more slashes, except when following the ":" character.
	// This is so the two slashes on "https://" and similar are not replaced.
	const doubleslashesRegex = `(?<!:)${opts.separator}{2,}`;

	// Matches one or more slashes at the end of the string.
	const trailingSlashesRegex = `${opts.separator}+$`;

	const joinedPath = paths.join(opts.separator).replaceAll(new RegExp(doubleslashesRegex, 'giu'), opts.separator);

	let normalizedPath = joinedPath;

	switch (opts.trailingSlash) {
		case true:
			normalizedPath = `${joinedPath}${opts.separator}`.replace(new RegExp(trailingSlashesRegex, 'iu'), opts.separator);
			break;
		case false:
			normalizedPath = joinedPath.replace(new RegExp(trailingSlashesRegex, 'iu'), '');
			break;
		case undefined:
		default:
	}

	return normalizedPath;
}
