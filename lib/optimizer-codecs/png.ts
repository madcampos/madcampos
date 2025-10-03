/**
 * Adapted from: {@link https://github.com/jimp-dev/jimp/blob/main/plugins/wasm-png/src/index.ts}
 */

/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { Format } from '@jimp/types';
import optimise, { init as initOptimizer } from '@jsquash/oxipng/optimise.js';
import decode, { init as initDecoder } from '@jsquash/png/decode.js';
import encode, { init as initEncoder } from '@jsquash/png/encode.js';
import z from 'zod';

import WASM_OPTIMIZER from '../../node_modules/@jsquash/oxipng/codec/pkg-parallel/squoosh_oxipng_bg.wasm';
import WASM_DECODER from '../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm';
import WASM_ENCODER from '../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm';

const PngOptionsSchema = z.object({
	colorSpace: z.union([z.literal('display-p3'), z.literal('srgb')]).optional(),
	optimize: z
		.object({
			/** whether to use PNG interlacing or not. Interlacing will increase the size of an optimised image. */
			interlace: z.boolean().optional().default(false),
			/** is the optimisation level between 1 to 6. The higher the level, the higher the compression. Any level above 4 is not recommended. */
			level: z.number().min(0).max(6).optional().default(2),
			/** whether to allow transparent pixels to be altered to improve compression. */
			optimiseAlpha: z.boolean().optional().default(false)
		})
		.optional()
});

type PngOptions = z.infer<typeof PngOptionsSchema>;

export default function png() {
	return {
		mime: 'image/png',
		hasAlpha: true,
		encode: async (bitmap, options: Partial<PngOptions> = {}) => {
			const { colorSpace = 'srgb', optimize } = PngOptionsSchema.parse(options);
			await initEncoder(WASM_ENCODER);
			let arrayBuffer = await encode({
				...bitmap,
				data: new Uint8ClampedArray(bitmap.data),
				colorSpace
			});

			if (optimize) {
				await initOptimizer(WASM_OPTIMIZER);
				arrayBuffer = await optimise(arrayBuffer, optimize);
			}

			return Buffer.from(arrayBuffer);
		},
		decode: async (data) => {
			await initDecoder(WASM_DECODER);
			const result = await decode(data as unknown as ArrayBuffer);

			return {
				data: Buffer.from(result.data),
				width: result.width,
				height: result.height
			};
		}
	} satisfies Format<'image/png'>;
}
