type ImageExtension = 'gif' | 'jpeg' | 'jpg' | 'png' | 'webp';

interface ImageMetadata {
	/**
	 * The image original path, before any transformations.
	 */
	src: string;

	/**
	 * The image intrinsic width.
	 */
	width: number;
	/**
	 * The image intrinsic height.
	 */
	height: number;
	/**
	 * The image extension.
	 */
	extension: ImageExtension;
	/**
	 * The image quality.
	 */
	quality: number;
}

interface ImageCacheOptions {
	/**
	 * The image source, it is the image's path before any optimizations have ran.
	 */
	src: string;

	/**
	 * The image desired width, in pixels.
	 */
	width?: number;

	/**
	 * The image desired height, in pixels.
	 */
	height?: number;

	/**
	 * The image desired extension, without the dot.
	 * @default 'webp'
	 */
	extension?: ImageExtension;

	/**
	 * The image quality to use by the optimizer.
	 * @default 75
	 */
	quality?: number;

	/**
	 * A list of widths to use for this image.
	 */
	sizes?: number[];

	/**
	 * If the name of the image should be kept when optimizing.
	 * If this option is not set, the image name will use a randomly generated UUID instead.
	 */
	keepName?: boolean;
}

interface ImageHtmlOptions {
	/**
	 * The image alt text
	 */
	altText: string;
	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#loading|loading attribute}.
	 */
	loading?: 'eager' | 'lazy';
	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#decoding|decoding attribute}.
	 */
	decoding?: 'async' | 'auto' | 'sync';
}

interface ImageOptimizerOptions {
	/**
	 * The path where public assets will be saved
	 * @default '_assets'
	 */
	publicAssetsPath?: string;

	/**
	 * The default image quality to use.
	 * @default 75
	 */
	defaultImageQuality?: number;

	/**
	 * The default file extension to use, without the dot.
	 * @default 'webp'
	 */
	defaultExtension?: ImageExtension;
}

export class ImageOptimizer {
	#PUBLIC_ASSETS_URL: URL;

	#imageCache = new Map<string, ImageMetadata>();
	#privateToPublicPathMap = new Map<string, string[]>();
	#defaultImageQuality: number;
	#defaultExtension: ImageExtension;

	constructor({ publicAssetsPath, defaultImageQuality, defaultExtension }: ImageOptimizerOptions = {}) {
		this.#PUBLIC_ASSETS_URL = new URL(publicAssetsPath ?? '_assets', 'https://assets.local/');
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		this.#defaultImageQuality = defaultImageQuality ?? 75;
		this.#defaultExtension = defaultExtension ?? 'webp';
	}

	get publicAssetsPath() {
		return this.#PUBLIC_ASSETS_URL.pathname;
	}

	addImageToCache(image: ImageCacheOptions) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [imageName, extension] = image.src.split('/').pop()!.split('.') as [string, ImageExtension];
		const newName = image.keepName ? imageName : crypto.randomUUID();
		const publicPath = new URL(`${newName}.${image.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

		this.#imageCache.set(publicPath, {
			src: image.src,
			extension: image.extension ?? extension ?? this.#defaultExtension,
			quality: image.quality ?? this.#defaultImageQuality,
			// TODO: figure out the image intrinsic width and height?
			width: 0,
			height: 0
		});

		const publicPaths = [publicPath];

		image.sizes?.forEach((size) => {
			const sizePublicPath = new URL(`${newName}-${size}.${image.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;
			this.#imageCache.set(sizePublicPath, {
				src: image.src,
				extension: image.extension ?? extension ?? this.#defaultExtension,
				quality: image.quality ?? this.#defaultImageQuality,
				// TODO: figure out the image intrinsic width and height?
				width: size,
				height: size
			});

			publicPaths.push(sizePublicPath);
		});

		this.#privateToPublicPathMap.set(image.src, publicPaths);

		return publicPath;
	}

	getImageMetadata(publicPath: string) {
		return this.#imageCache.get(publicPath);
	}

	getImageSizes(publicPath: string) {
		const baseImageMetadata = this.#imageCache.get(publicPath);

		if (!baseImageMetadata) {
			return [];
		}

		const publicPaths = this.#privateToPublicPathMap.get(baseImageMetadata.src) ?? [];

		return [
			baseImageMetadata,
			...publicPaths
				.map((path) => this.#imageCache.get(path))
				.filter((metadata) => metadata !== undefined)
		];
	}

	getImageHtml(src: string, { altText, loading, decoding }: ImageHtmlOptions) {
		const imageMetadata = this.#imageCache.get(src);

		if (imageMetadata) {
			// TODO: process image metadata and add sizes and srcset
		}

		return `<img src="${src}" alt="${altText}" loading="${loading ?? 'lazy'}" decoding="${decoding ?? 'auto'}" />`;
	}

	async fetchImage(assets: Env['Assets'], imagePath: string) {
		if (!this.#imageCache.has(imagePath)) {
			return new Response(`Image does not exist: "${imagePath}"`, { status: 404 });
		}

		const existingAssetResponse = await assets.fetch(new URL(imagePath, this.#PUBLIC_ASSETS_URL));

		if (existingAssetResponse.ok) {
			return existingAssetResponse;
		}

		// TODO: optimize image and save results
	}

	generateManifest() {
		// TODO: generate a manifest of optimized information, this will be loaded and used as references.
	}
}
