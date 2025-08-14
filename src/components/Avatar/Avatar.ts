import { html } from '@lit-labs/ssr';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const AVATAR_WIDTHS = [128, 256, 512, 768, 1024];

interface Props {
	src: string;
	alt: string;
	loading?: 'eager' | 'lazy';
}

function generateImgSrcs(src: string) {
	// TODO: generate sources for images
	return '';
}

export function avatar({ src, alt, loading }: Props) {
	return html`
		<m-avatar>
			<picture
				class="user-avatar"
				itemprop="image"
				itemscope
				itemtype="https://schema.org/ImageObject"
			>
				<img
					class="u-photo photo"
					itemprop="contentUrl"
					src="${src}"
					alt="${alt}"
					loading="${loading ?? 'lazy'}"
					decoding="async"
					srcset="${generateImgSrcs(src)}"
					width="128"
					height="128"
					sizes="(max-width: 360px) 128px, (max-width: 720px) 256px, (max-width: 1280px) 512px, (max-width: 2160px) 768px 1024px"
				/>
			</picture>
		</m-avatar>
	`;
}
