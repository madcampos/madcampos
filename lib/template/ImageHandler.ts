import type { ImageOptimizer } from '../ImageOptimizer.ts';
import type { BaseElementHandler } from './BaseHandler.ts';

export class ImageHandler implements HTMLRewriterElementContentHandlers, BaseElementHandler {
	static readonly selector = 'img';

	/**
	 * The attribute for setting the image quality for processing the images.
	 * If not present, the default quality will be used.
	 */
	static qualityAttribute = '@quality';

	/**
	 * The attribute for setting the image widths for generating a `srcset`.
	 * If not present, the default quality will be used.
	 */
	static widthsAttribute = '@widths';

	/**
	 * The attribute for setting the image densities for generating a `srcset`.
	 * If not present, the default quality will be used.
	 */
	static densitiesAttribute = '@densities';

	/**
	 * The attribute for skipping image optimization.
	 */
	static skipOptimAttribute = '@no-optimize';

	#imageOptimizer: ImageOptimizer;

	constructor(imageOptimizer: ImageOptimizer) {
		this.#imageOptimizer = imageOptimizer;
	}

	async element(element: Element) {
		if (element.hasAttribute(ImageHandler.skipOptimAttribute)) {
			element.removeAttribute(ImageHandler.skipOptimAttribute);
			return;
		}

		if (!element.getAttribute('src')) {
			element.removeAttribute(ImageHandler.qualityAttribute);
			element.removeAttribute(ImageHandler.densitiesAttribute);
			element.removeAttribute(ImageHandler.widthsAttribute);

			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const src = element.getAttribute('src')!;
		const quality = element.getAttribute(ImageHandler.qualityAttribute);
		const width = element.getAttribute('width');
		const height = element.getAttribute('height');
		const widths = element.getAttribute(ImageHandler.widthsAttribute)?.split(',').map((w) => Number.parseInt(w.trim()));
		const densities = element.getAttribute(ImageHandler.densitiesAttribute)?.split(',').map((w) => Number.parseInt(w.trim()));

		const newSrc = (await this.#imageOptimizer.addImageToCache({
			src,
			quality: quality ? Number.parseInt(quality) : undefined,
			width: width ? Number.parseInt(width) : undefined,
			height: height ? Number.parseInt(height) : undefined,
			widths,
			densities
		})) ?? src;

		element.setAttribute('src', newSrc);

		if (element.hasAttribute(ImageHandler.widthsAttribute)) {
			const srcSet = this.#imageOptimizer.getImageSourceSet(newSrc);

			element.setAttribute('srcset', srcSet);
		}

		element.removeAttribute(ImageHandler.qualityAttribute);
		element.removeAttribute(ImageHandler.densitiesAttribute);
		element.removeAttribute(ImageHandler.widthsAttribute);
	}
}
