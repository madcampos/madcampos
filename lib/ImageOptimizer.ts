import { createJimp } from '@jimp/core';
import { basename, extname } from '@std/path/posix';
import { defaultPlugins, ResizeStrategy } from 'jimp';
import jpeg from './optimizer-codecs/jpeg.ts';
import png from './optimizer-codecs/png.ts';
import webp from './optimizer-codecs/webp.ts';

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

export interface ImageOptimizerOptions {
	/**
	 * The path where public assets will be saved
	 * @default '_assets'
	 */
	publicAssetsPath?: string;

	/**
	 * The JSON file, inside the assets folder containing a mapping from the assets original path to the transformed name.
	 *
	 * It should be an object where each key is the original path.
	 * The values are strings with the transformed name for the asset.
	 *
	 * The entry paths is relative to the assets folder.
	 * @default 'index.json'
	 */
	assetsManifestFile?: string;

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
	#ASSETS_MANIFEST_URL: URL;
	#PUBLIC_ASSETS_URL: URL;

	#imageMetadataCache = new Map<string, ImageMetadata>();
	#imageResponseCache = new Map<string, Response>();
	#privateToPublicPathMap = new Map<string, string[]>();
	#defaultImageQuality: number;
	#defaultExtension: ImageExtension;
	#assetsManifest!: Map<string, string>;

	constructor({ publicAssetsPath, assetsManifestFile, defaultImageQuality, defaultExtension }: ImageOptimizerOptions = {}) {
		this.#PUBLIC_ASSETS_URL = new URL(publicAssetsPath ?? '_assets/', 'https://assets.local/');
		this.#ASSETS_MANIFEST_URL = new URL(assetsManifestFile ?? 'index.json', this.#PUBLIC_ASSETS_URL);

		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		this.#defaultImageQuality = defaultImageQuality ?? 75;
		this.#defaultExtension = defaultExtension ?? 'webp';
	}

	get publicAssetsPath() {
		return this.#PUBLIC_ASSETS_URL.pathname;
	}

	get assetsManifestPath() {
		return this.#ASSETS_MANIFEST_URL.pathname;
	}

	async #initAssetsManifest(assets: Env['Assets']) {
		if (!this.#assetsManifest) {
			const response = await assets.fetch(this.#ASSETS_MANIFEST_URL);

			if (!response.ok) {
				console.error(`Failed to fetch assets manifest file at: ${this.#ASSETS_MANIFEST_URL.pathname}`);
			} else {
				this.#assetsManifest = new Map(Object.entries(await response.json<Record<string, string>>()));
			}
		}
	}

	async #loadImage(assets: Env['Assets'], src: string) {
		const imageResponse = await assets.fetch(new URL(src, 'https://assets.local/'));

		if (!imageResponse.ok) {
			throw new Error(`Image file does not exist: "${src}"`);
		}

		const Jimp = createJimp({
			formats: [jpeg, png, webp],
			plugins: defaultPlugins
		});

		const imageBuffer = await imageResponse.arrayBuffer();

		return Jimp.fromBuffer(imageBuffer);
	}

	async addImageToCache(assets: Env['Assets'], imageOptions: ImageCacheOptions) {
		await this.#initAssetsManifest(assets);

		// TODO: add support for gifs and svgs
		if (imageOptions.src.endsWith('.gif') || imageOptions.src.endsWith('.svg')) {
			return imageOptions.src;
		}

		const image = await this.#loadImage(assets, imageOptions.src);

		const imageName = basename(imageOptions.src);
		const extension = extname(imageName) as ImageExtension;
		let newName = imageName;

		if (!imageOptions.keepName) {
			newName = crypto.randomUUID();
		}

		if (this.#assetsManifest.has(imageOptions.src)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			newName = this.#assetsManifest.get(imageOptions.src)!;
		} else {
			this.#assetsManifest.set(imageOptions.src, newName);
		}

		const publicPath = new URL(`${newName}.${imageOptions.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

		this.#imageMetadataCache.set(publicPath, {
			src: imageOptions.src,
			extension: imageOptions.extension ?? extension ?? this.#defaultExtension,
			quality: imageOptions.quality ?? this.#defaultImageQuality,
			width: image.width,
			height: image.height
		});

		const publicPaths = [publicPath];

		imageOptions.widths?.forEach((width) => {
			const sizePublicPath = new URL(`${newName}-${width}w.${imageOptions.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;

			this.#imageMetadataCache.set(sizePublicPath, {
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

			this.#imageMetadataCache.set(sizePublicPath, {
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
		return this.#imageMetadataCache.get(publicPath);
	}

	getImageSourceSet(publicPath: string) {
		const imageMetadata = this.#imageMetadataCache.get(publicPath);

		if (!imageMetadata) {
			return '';
		}

		const publicMetadata = (this.#privateToPublicPathMap.get(imageMetadata.src) ?? [])
			.reduce<[string, ImageMetadata][]>((results, path) => {
				if (this.#imageMetadataCache.has(path)) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					results.push([path, this.#imageMetadataCache.get(path)!]);
				}

				return results;
			}, [])
			.sort(([, { width: widthA }], [, { width: widthB }]) => widthA - widthB);

		if (!publicMetadata.length) {
			return '';
		}

		return publicMetadata.map(([path, { width, density }]) => {
			let descriptor = '';

			if (width) {
				descriptor = `${width.toString()}w`;
			}

			if (density) {
				descriptor = `${density.toString()}x`;
			}

			return `${path} ${descriptor}`;
		}).join(', ');
	}

	async fetchImage(assets: Env['Assets'], imagePath: string) {
		if (!this.#imageMetadataCache.has(imagePath)) {
			return new Response(`Image does not exist: "${imagePath}"`, { status: 404 });
		}

		if (this.#imageResponseCache.has(imagePath)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this.#imageResponseCache.get(imagePath)!;
		}

		const existingAssetResponse = await assets.fetch(new URL(imagePath, this.#PUBLIC_ASSETS_URL));

		if (existingAssetResponse.ok) {
			return existingAssetResponse;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const imageMetadata = this.#imageMetadataCache.get(imagePath)!;

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
		const response = new Response(imageBuffer, {
			status: 200,
			headers: { 'Content-Type': 'image/webp' }
		});

		this.#imageResponseCache.set(imagePath, response);

		return response.clone();
	}

	getImageResponse(imagePath: string) {
		return this.#imageResponseCache.get(imagePath);
	}

	generateManifest() {
		return Object.fromEntries(this.#assetsManifest.entries());
	}
}
