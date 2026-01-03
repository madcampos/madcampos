import { SiteSettings } from '../settings.ts';

class ShareOptions extends HTMLElement implements CustomElement {
	constructor() {
		super();

		this.innerHTML = `
			<aside aria-labell="post-share-label">
				<sr-only is="post-share-label">Share Options</sr-only>
				<button type="button" class="share-os-link" title="Share Page Link">
					<sr-only>Share Page Link</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#share-icon-share" width="24" height="24" />
					</svg>
				</button>
				<button type="button" class="share-copy" title="Copy Page Link">
					<sr-only>Copy Page Link</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#share-icon-copy" width="24" height="24" />
					</svg>
				</button>
				<button type="button" class="share-email" title="Share via Email">
					<sr-only>Share via Email</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#share-icon-email" width="24" height="24" />
					</svg>
				</button>
				<button type="button" class="share-sms" title="Share via SMS">
					<sr-only>Share via SMS</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#share-icon-sms" width="24" height="24" />
					</svg>
				</button>
				<button type="button" class="share-print" title="Print Page">
					<sr-only>Print Page</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#share-icon-print" width="24" height="24" />
					</svg>
				</button>
			</aside>
		`;
	}

	connectedCallback() {
		const url = window.location.href;
		const title = document.querySelector<HTMLElement>('h1')?.innerText ?? '';
		const description = document.querySelector<HTMLElement>('meta[name="description"]')?.getAttribute('content') ?? 'Check out this page!';

		this.querySelector('.share-os-link')?.addEventListener('click', async () => {
			await navigator.share({
				url,
				title,
				text: description
			});
		});

		this.querySelector('.share-sms')?.addEventListener('click', () => {
			const text = `${title}\n\n${description}\n${url}`;

			window.open(`sms://;?&body=${encodeURIComponent(text)}`);
		});

		this.querySelector('.share-email')?.addEventListener('click', () => {
			const subject = encodeURIComponent(title);
			const body = encodeURIComponent(`${description}\n${url}`);

			window.open(`mailto:?subject=${subject}&body=${body}`);
		});

		this.querySelector('.share-copy')?.addEventListener('click', async () => {
			await navigator.clipboard.writeText(url);
		});

		this.querySelector('.share-print')?.addEventListener('click', () => {
			window.print();
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('share-options')) {
	customElements.define('share-options', ShareOptions);
}
