import { SiteSettings } from '../settings.ts';

export class YoutubeEmbed extends HTMLElement implements CustomElement {
	static observedAttributes = ['title', 'href'];

	declare shadowRoot: ShadowRoot;

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
	}

	override get title(): string {
		return this.getAttribute('title') ?? '';
	}

	override set title(newValue: string | null | undefined) {
		if (newValue) {
			this.setAttribute('title', newValue);
		} else {
			this.removeAttribute('title');
		}

		this.render();
	}

	get href(): URL | undefined {
		const urlText = this.getAttribute('href');

		if (!urlText) {
			return;
		}

		return new URL(urlText, 'https://www.youtube.com/');
	}

	set href(newValue: URL | string | null | undefined) {
		if (newValue) {
			this.setAttribute('href', newValue.toString());
		} else {
			this.removeAttribute('href');
		}

		this.render();
	}

	get videoId() {
		return this.href?.searchParams.get('v') ?? '';
	}

	render() {
		this.shadowRoot.innerHTML = `
			<style>
				iframe {
					display: block;
					margin-inline: auto;
					max-block-size: 100%;
					max-inline-size: var(--size-content-3);
					block-size: auto;
					border-style: none;
					min-inline-size: var(--size-content-1);
					min-block-size: var(--size-content-1);
					object-fit: contain;
					object-position: center;
					border: var(--border-style) var(--border-width) var(--theme-color);
					border-radius: var(--border-radius);
					aspect-ratio: 3 / 2;
					inline-size: 100%;
					overflow: clip;
				}
			</style>
			<iframe
				title="${this.title}"
				src="https://www.youtube-nocookie.com/embed/${this.videoId}"
				width="300"
				height="400"
				frameborder="0"
				scrolling="no"
				loading="lazy"
				allowfullscreen
				allowtransparency
				credentialless
				referrerpolicy="strict-origin"
				sandbox="allow-scripts allow-same-origin"
				allow="accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; battery 'none'; browsing-topics 'none'; camera 'none'; display-capture 'none'; domain-agent 'none'; document-domain 'none'; encrypted-media 'none'; execution-while-not-rendered 'none'; execution-while-out-of-viewport ''; gamepad 'none'; geolocation 'none'; gyroscope 'none'; hid 'none'; identity-credentials-get 'none'; idle-detection 'none'; local-fonts 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; otp-credentials 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-create 'none'; publickey-credentials-get 'none'; screen-wake-lock 'none'; serial 'none'; speaker-selection 'none'; usb 'none'; window-management 'none'; xr-spatial-tracking 'none'"
				csp="sandbox allow-scripts allow-same-origin;"
			></iframe>
		`;
	}

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case 'href':
				this.href = newValue;
				break;
			case 'title':
				this.title = newValue;
				break;
			default:
		}
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('youtube-embed')) {
	customElements.define('youtube-embed', YoutubeEmbed);
}
