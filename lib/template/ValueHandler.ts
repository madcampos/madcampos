import type { FilterFunction } from '../TemplateRenderer.ts';

export class ValueHandler {
	static filters: Record<string, FilterFunction> = {};

	static filterSeparator = '|';

	static getValue<T>(path: string, data?: T, shouldReport = true) {
		if (!path) {
			throw new Error('Missing property path!');
		}

		if (!data && shouldReport) {
			console.warn(`Missing data for property "${path}"`);
			return undefined;
		}

		const [firstPart, ...pathParts] = path.trim().split('.');

		if (!firstPart) {
			return undefined;
		}

		// @ts-expect-error
		let result = data?.[firstPart];
		let pathPartIndex = 0;

		if ((result === null || result === undefined) && shouldReport) {
			console.warn(`Missing data for property "${firstPart}"`);
			return undefined;
		}

		while (pathPartIndex < pathParts.length && result) {
			const pathPart = pathParts[pathPartIndex];

			if (result?.[pathPart]) {
				result = result[pathPart];
			} else {
				if (shouldReport) {
					console.warn(`Missing data for property "${firstPart}.${pathParts.slice(0, pathPartIndex + 1).join('.')}"`);
				}

				result = undefined;
			}

			pathPartIndex += 1;
		}

		return result;
	}

	static formatValue(value?: unknown) {
		if (value === null || value === undefined) {
			return '';
		}

		if (['string', 'number', 'boolean', 'bigint'].includes(typeof value)) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return value.toString();
		}

		if (typeof value === 'function') {
			const formattedResult: string = ValueHandler.formatValue(value());

			return formattedResult;
		}

		if ('toString' in (value as Object)) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			return value.toString();
		}

		return '';
	}

	static processInterpolation<R, T>(propString: string, data?: T) {
		const [prop, ...filters] = propString?.split(ValueHandler.filterSeparator) ?? [];
		let resolvedValue = ValueHandler.getValue(prop ?? '', data) as R;

		if (filters.length) {
			for (const filter of filters) {
				const [filterName = '', ...filterArgs] = filter.trim().split(' ');
				const filterfunction = ValueHandler.filters[filterName];

				if (!filterfunction) {
					console.warn(`Missing filter function: ${filterName}`);
					continue;
				}

				resolvedValue = filterfunction(resolvedValue, ...filterArgs) as R;
			}
		}

		return resolvedValue;
	}
}
