import { SiteSettings } from '../settings.ts';

export class CodepenEmbed extends HTMLElement implements CustomElement {
	static observedAttributes = ['title', 'href', 'tab'];
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

		return new URL(urlText, 'https://codepen.io/');
	}

	set href(newValue: URL | string | null | undefined) {
		if (newValue) {
			this.setAttribute('href', newValue.toString());
		} else {
			this.removeAttribute('href');
		}

		this.render();
	}

	get username() {
		// pathname: /<user>/pen/<id>
		return this.href?.pathname.split('/')[1] ?? '';
	}

	get penId() {
		// pathname: /<user>/pen/<id>
		return this.href?.pathname.split('/')[3] ?? '';
	}

	get tab(): string {
		return this.getAttribute('tab') ?? 'result';
	}

	set tab(newValue: string | null | undefined) {
		if (newValue) {
			this.setAttribute('tab', newValue);
		} else {
			this.removeAttribute('tab');
		}

		this.render();
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
					border: var(--border-style) var(--border-size) var(--theme-color);
					border-radius: var(--border-radius);
					aspect-ratio: 3 / 2;
					inline-size: 100%;
					overflow: clip;
				}
			</style>
			<iframe
				title="${this.title}"
				src="https://codepen.io/${this.username}/embed/preview/${this.penId}?default-tab=${this.tab}"
				width="300"
				height="400"
				frameborder="0"
				scrolling="no"
				loading="lazy"
				allowfullscreen
				allowtransparency
				credentialless
				referrerpolicy="strict-origin"
				sandbox="allow-forms allow-scripts allow-same-origin"
			>
				<p>
					<span>See the Pen</span>
					<span><a href="${this.href}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${this.title}</a></span>
					<span>by <a href="https://codepen.io/${this.username}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">@${this.username}</a></span>
					<span>on <a href="https://codepen.io" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">CodePen</a>.</span>
				</p>
			</iframe>
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
			case 'tab':
				this.tab = newValue;
				break;
			default:
		}
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('codepen-embed')) {
	customElements.define('codepen-embed', CodepenEmbed);
}
