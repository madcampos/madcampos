interface ImageMetadata {
	src: string;
	extension?: string;
	width?: number;
	sizes?: number[];
	quality?: number;
	keepName?: true;
}

export class ImageOptimizer {
	#PUBLIC_ASSETS_PATH: URL;

	#imageCache = new Map<string, ImageMetadata>();
	#privateToPublicPathMap = new Map<string, string[]>();

	addImageToCache(image: ImageMetadata) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [imageName, extension] = image.src.split('/').pop()!.split('.');
		const newName = image.keepName ? imageName : crypto.randomUUID();
		const publicPath = new URL(`${newName}.${image.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;
		this.#imageCache.set(publicPath, image);

		const publicPaths = [publicPath];

		image.sizes?.forEach((size) => {
			const sizePublicPath = new URL(`${newName}-${size}.${image.extension ?? extension}`, this.#PUBLIC_ASSETS_URL).pathname;
			this.#imageCache.set(sizePublicPath, {
				src: image.src,
				extension: image.extension ?? extension,
				width: size,
				quality: image.quality,
				keepName: image.keepName
			});

			publicPaths.push(sizePublicPath);
		});

		this.#privateToPublicPathMap.set(image.src, publicPaths);

		return publicPath;
	}

	getImagePaths(privatePath: string) {
		return this.#privateToPublicPathMap.get(privatePath);
	}

	async fetchImage(assets: Env['Assets'], imagePath: string) {
		const existingAssetResponse = await assets.fetch(new URL(imagePath, this.#PUBLIC_ASSETS_PATH));

		if (existingAssetResponse.ok) {
			return existingAssetResponse;
		}

		// TODO: optimize image and save results
	}
}
