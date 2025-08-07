import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const AVATAR_WIDTHS = [128, 256, 512, 768, 1024];

@customElement('m-avatar')
export class Avatar extends LitElement {
	static override styles = css`
		.user-avatar {
			--image-size: var(--avatar-size);
			display: block;
			position: relative;
			border: var(--theme-color) var(--border-style) var(--border-width);
			border-radius: 100vmax;
			width: var(--image-size);
			height: var(--image-size);
			overflow: hidden;
		}

		.user-avatar img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
		}

		.user-avatar::after {
			display: block;
			position: absolute;
			opacity: 0.2;
			transition: all 0.2s ease-in-out;
			inset: 0;
			background: radial-gradient(circle at bottom, var(--accent-color), var(--theme-color));
			width: 100%;
			height: 100%;
			content: '';
		}

		.user-avatar:hover::after { opacity: 0.4; }

		@media (prefers-contrast: more) {
			.user-avatar::after {
				opacity: 0.4;
				backdrop-filter: contrast(200%);
				background: radial-gradient(circle at bottom, transparent, var(--theme-color));
			}
		}

		@media (forced-colors: active) {
			.user-avatar { filter: grayscale(1) contrast(120%) brightness(110%); }

			.user-avatar::after {
				opacity: 0;
				backdrop-filter: none;
				background: none;
			}
		}

		@media (prefers-reduced-transparency: reduce) {
			.user-avatar::after {
				opacity: 0;
				backdrop-filter: none;
				background: none;
			}
		}
	`;

	@property({ type: String })
	src = '';

	@property({ type: String })
	alt = '';

	@property({
		type: String,
		converter: (value) => ['eager', 'lazy'].includes(value as string) ? value : 'lazy',
		useDefault: true
	})
	loading = 'lazy';

	#imageSrcs() {
		// TODO: generate sources for images
		return '';
	}

	protected override render() {
		return html`
			<picture
				class="user-avatar"
				itemprop="image"
				itemscope
				itemtype="https://schema.org/ImageObject"
			>
			<img
				class="u-photo photo"
				itemprop="contentUrl"
				src="${this.src}"
				alt="${this.alt}"
				loading="${this.loading}"
				decoding="async"
				srcset="${this.#imageSrcs()}"
				width="128"
				height="128"
				sizes="(max-width: 360px) 128px, (max-width: 720px) 256px, (max-width: 1280px) 512px, (max-width: 2160px) 768px 1024px"
			/>
		</picture>
	`;
	}
}
