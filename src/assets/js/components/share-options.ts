import { SiteSettings } from '../settings.ts';

class ShareOptions extends HTMLElement implements CustomElement {
	readonly #url = window.location.href;
	readonly #title = document.querySelector<HTMLElement>('h1')?.innerText ?? '';
	readonly #description = document.querySelector<HTMLElement>('meta[name="description"]')?.getAttribute('content') ?? 'Check out this page!';

	constructor() {
		super();

		this.innerHTML = `
			<sr-only>Share Options</sr-only>

			<button type="button" data-share="os">
				<sr-only>Share Page Link</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-share" width="24" height="24" />
				</svg>
			</button>
			<button type="button" data-share="copy">
				<sr-only>Copy Page Link</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-copy" width="24" height="24" />
				</svg>
			</button>
			<button type="button" data-share="email">
				<sr-only>Share via Email</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-email" width="24" height="24" />
				</svg>
			</button>
			<button type="button" data-share="sms">
				<sr-only>Share via SMS</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-sms" width="24" height="24" />
				</svg>
			</button>
			<button type="button" data-share="print">
				<sr-only>Print Page</sr-only>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-print" width="24" height="24" />
				</svg>
			</button>
		`;

		if (!('share' in navigator)) {
			this.querySelector('button[data-share="os"]-link')?.toggleAttribute('hidden', true);
		}
	}

	#smsShare() {
		const text = `${this.#title}\n\n${this.#description}\n${this.#url}`;

		window.open(`sms://;?&body=${encodeURIComponent(text)}`);
	}

	#emailShare() {
		const subject = encodeURIComponent(this.#title);
		const body = encodeURIComponent(`${this.#description}\n${this.#url}`);

		window.open(`mailto:?subject=${subject}&body=${body}`);
	}

	async handleEvent(evt: Event) {
		if (evt.type !== 'click') {
			return;
		}

		const target = evt.target as HTMLElement;

		if (!target.dataset['share']) {
			return;
		}

		switch (target.dataset['share']) {
			case 'os':
				await navigator.share({
					url: this.#url,
					title: this.#title,
					text: this.#description
				});
				break;
			case 'sms':
				this.#smsShare();
				break;
			case 'email':
				this.#emailShare();
				break;
			case 'copy':
				await navigator.clipboard.writeText(this.#url);
				break;
			case 'print':
				window.print();
				break;
			default:
		}
	}

	connectedCallback() {
		this.querySelector('[data-share="os"]')?.addEventListener('click', this);
		this.querySelector('[data-share="sms"]')?.addEventListener('click', this);
		this.querySelector('[data-share="email"]')?.addEventListener('click', this);
		this.querySelector('[data-share="copy"]')?.addEventListener('click', this);
		this.querySelector('[data-share="print"]')?.addEventListener('click', this);
	}

	disconnectedCallback() {
		this.querySelector('[data-share="os"]')?.removeEventListener('click', this);
		this.querySelector('[data-share="sms"]')?.removeEventListener('click', this);
		this.querySelector('[data-share="email"]')?.removeEventListener('click', this);
		this.querySelector('[data-share="copy"]')?.removeEventListener('click', this);
		this.querySelector('[data-share="print"]')?.removeEventListener('click', this);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('share-options')) {
	customElements.define('share-options', ShareOptions);
}
