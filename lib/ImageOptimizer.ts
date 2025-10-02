import { createJimp } from '@jimp/core';
import jpeg from '@jimp/wasm-jpeg';
import png from '@jimp/wasm-png';
import webp from '@jimp/wasm-webp';
import { defaultFormats, defaultPlugins, ResizeStrategy } from 'jimp';

type ImageExtension = 'gif' | 'jpeg' | 'jpg' | 'png' | 'webp';

interface ImageMetadata {
	/**
	 * The image original path, before any transformations.
	 */
	src: string;

	/**
	 * The image density.
	 */
	density?: number;

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
	widths?: number[];

	/**
	 * A list of densities to use for this image.
	 */
	densities?: number[];

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

	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#sizes|sizes attribute}
	 */
	sizes?: string;

	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#referrerpolicy|referrerpolicy attribute}
	 */
	referrerPolicy?: string;

	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#fetchpriority|fetchpriority attribute}
	 */
	fetchPriority?: string;

	/**
	 * The image {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin|crossorigin attribute}
	 */
	crossOrigin?: string;
}

export interface ImageOptimizerOptions {
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
		this.#PUBLIC_ASSETS_URL = new URL(publicAssetsPath ?? '_assets/', 'https://assets.local/');
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		this.#defaultImageQuality = defaultImageQuality ?? 75;
		this.#defaultExtension = defaultExtension ?? 'webp';
	}

	get publicAssetsPath() {
		return this.#PUBLIC_ASSETS_URL.pathname;
	}

	async #loadImage(assets: Env['Assets'], src: string) {
		const imageResponse = await assets.fetch(new URL(src, 'https://assets.local/'));

		if (!imageResponse.ok) {
			throw new Error(`Image file does not exist: "${src}"`);
		}

		const Jimp = createJimp({
			formats: [...defaultFormats, webp],
			plugins: defaultPlugins
		});

		const imageBuffer = await imageResponse.arrayBuffer();

		return Jimp.fromBuffer(imageBuffer);
	}

	async addImageToCache(assets: Env['Assets'], imageOptions: ImageCacheOptions) {
		const image = await this.#loadImage(assets, imageOptions.src);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [imageName, extension] = imageOptions.src.split('/').pop()!.split('.') as [string, ImageExtension];
		const newName = imageOptions.keepName ? imageName : crypto.randomUUID();
		const publicPath = new URL(`${newName}.${imageOptions.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

		this.#imageCache.set(publicPath, {
			src: imageOptions.src,
			extension: imageOptions.extension ?? extension ?? this.#defaultExtension,
			quality: imageOptions.quality ?? this.#defaultImageQuality,
			width: image.width,
			height: image.height
		});

		const publicPaths = [publicPath];

		imageOptions.widths?.forEach((width) => {
			const sizePublicPath = new URL(`${newName}-${width}w.${imageOptions.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

			this.#imageCache.set(sizePublicPath, {
				src: imageOptions.src,
				extension: imageOptions.extension ?? extension ?? this.#defaultExtension,
				quality: imageOptions.quality ?? this.#defaultImageQuality,
				width,
				height: (image.height / image.width) * width
			});

			publicPaths.push(sizePublicPath);
		});

		imageOptions.densities?.forEach((density) => {
			const sizePublicPath = new URL(`${newName}-${density}x.${imageOptions.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

			this.#imageCache.set(sizePublicPath, {
				src: imageOptions.src,
				extension: imageOptions.extension ?? extension ?? this.#defaultExtension,
				quality: imageOptions.quality ?? this.#defaultImageQuality,
				width: image.width * density,
				height: image.height * density,
				density
			});

			publicPaths.push(sizePublicPath);
		});

		this.#privateToPublicPathMap.set(imageOptions.src, publicPaths);

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

	getImageHtml(src: string, { altText, loading, decoding, crossOrigin, fetchPriority, referrerPolicy, sizes }: ImageHtmlOptions) {
		const imageMetadata = this.#imageCache.get(src);

		let srcSet: string | undefined;
		if (imageMetadata) {
			const publicMetadata = (this.#privateToPublicPathMap.get(imageMetadata.src) ?? [])
				.reduce<[string, ImageMetadata][]>((results, publicPath) => {
					if (this.#imageCache.has(publicPath)) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						results.push([publicPath, this.#imageCache.get(publicPath)!]);
					}

					return results;
				}, [])
				.sort(([, { width: widthA }], [, { width: widthB }]) => widthA - widthB);

			if (publicMetadata.length) {
				srcSet = publicMetadata.map(([publicPath, { width, density }]) => {
					let descriptor = '';

					if (width) {
						descriptor = `${width.toString()}w`;
					}

					if (density) {
						descriptor = `${density.toString()}x`;
					}

					return `${publicPath} ${descriptor}`;
				}).join(', ');
			}
		}

		return `<img
			src="${src}"
			alt="${altText}"
			loading="${loading ?? 'lazy'}"
			decoding="${decoding ?? 'auto'}"
			fetchpriority="${fetchPriority ?? 'auto'}"
			referrerpolicy="${referrerPolicy ?? 'no-referrer'}"
			${crossOrigin ? `crossorigin="${crossOrigin}"` : ''}
			${srcSet ? `srcset="${srcSet}"` : ''}
			${sizes ? `sizes="${sizes}"` : ''}
		/>`;
	}

	async fetchImage(assets: Env['Assets'], imagePath: string) {
		if (!this.#imageCache.has(imagePath)) {
			return new Response(`Image does not exist: "${imagePath}"`, { status: 404 });
		}

		const existingAssetResponse = await assets.fetch(new URL(imagePath, this.#PUBLIC_ASSETS_URL));

		if (existingAssetResponse.ok) {
			return existingAssetResponse;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const imageMetadata = this.#imageCache.get(imagePath)!;

		const image = await this.#loadImage(assets, imageMetadata.src);

		if (image.width !== imageMetadata.width || image.height !== imageMetadata.height) {
			image.resize({
				h: imageMetadata.height,
				w: imageMetadata.width,
				mode: ResizeStrategy.HERMITE
			});
		}

		image.quantize({
			colorDistanceFormula: 'euclidean-bt709',
			imageQuantization: 'floyd-steinberg',
			paletteQuantization: 'wuquant'
		});

		const imageBuffer = (await image.getBuffer('image/webp', {})).buffer as ArrayBuffer;

		return new Response(imageBuffer, {
			status: 200,
			headers: { 'Content-Type': 'image/webp' }
		});
	}

	generateManifest() {
		// TODO: generate a manifest of optimized information, this will be loaded and used as references.
	}
}
