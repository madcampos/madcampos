import { SiteSettings } from '../settings.ts';

class ShareOptions extends HTMLElement implements CustomElement {
	constructor() {
		super();

		this.innerHTML = `
			<aside aria-labell="post-share-label">
				<sr-only is="post-share-label">Share Options</sr-only>
				<button type="button" id="share-os-link" title="Share Page Link">
					<sr-only>Share Page Link</sr-only>
					<svg data-icon="mingcute:share-forward-line" width="24" height="24" viewBox="0 0 24 24">
						<path fill="currentColor" d="M10.114 4.491c.076-.795.906-1.45 1.743-.972c1.74 1.019 3.382 2.18 4.97 3.421c1.96 1.548 3.533 3.007 4.647 4.172c.483.507.438 1.308-.024 1.792a42 42 0 0 1-3.495 3.228c-1.938 1.587-3.945 3.125-6.13 4.358c-.741.418-1.544-.06-1.687-.801l-.017-.113l-.227-3.574c-1.816.038-3.574.662-4.98 1.823l-.265.222l-.128.104l-.247.192l-.12.088l-.23.16a5 5 0 0 1-.218.135l-.206.111C2.534 19.314 2 18.892 2 17c0-4.404 3.245-8.323 7.632-8.917l.259-.031zm1.909 1.474l-.192 3.472a.5.5 0 0 1-.447.47l-1.361.142c-3.065.366-5.497 2.762-5.948 5.894a9.95 9.95 0 0 1 5.135-1.912l.397-.023l1.704-.036a.5.5 0 0 1 .51.472l.197 3.596c1.603-1.021 3.131-2.196 4.664-3.45a44 44 0 0 0 2.857-2.595l-.258-.256l-.556-.533a48 48 0 0 0-3.134-2.693a46 46 0 0 0-3.568-2.548"/>
					</svg>
				</button>
				<button type="button" id="share-copy" title="Copy Page Link">
					<sr-only>Copy Page Link</sr-only>
					<svg data-icon="mingcute:copy-line" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-4 6H5v12h10zm-5 7a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7a1 1 0 0 1 .117 1.993L12 13H8a1 1 0 0 1-.117-1.993L8 11z"/>
					</svg>
				</button>
				<button type="button" id="share-email" title="Share via Email">
					<sr-only>Share via Email</sr-only>
					<svg data-icon="mingcute:mail-send-line" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" d="M20 4a2 2 0 0 1 1.995 1.85L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18v-1h2v1h16V7.414l-6.94 6.94a1.5 1.5 0 0 1-2.007.103l-.114-.103L4 7.414V8H2V6a2 2 0 0 1 1.85-1.995L4 4zM6 13a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2zm12.586-7H5.414L12 12.586zM5 10a1 1 0 0 1 .117 1.993L5 12H2a1 1 0 0 1-.117-1.993L2 10z"/>
					</svg>
				</button>
				<button type="button" id="share-sms" title="Share via SMS">
					<sr-only>Share via SMS</sr-only>
					<svg data-icon="mingcute:message-4-line" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" d="M19 3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7.333L4 21.5c-.824.618-2 .03-2-1V6a3 3 0 0 1 3-3zm0 2H5a1 1 0 0 0-1 1v13l2.133-1.6a2 2 0 0 1 1.2-.4H19a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-8 7a1 1 0 0 1 .117 1.993L11 14H8a1 1 0 0 1-.117-1.993L8 12zm5-4a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2z"/>
					</svg>
				</button>
				<button type="button" id="share-print" title="Print Page">
					<sr-only>Print Page</sr-only>
					<svg data-icon="mingcute:print-line" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" d="M16.9 3a1.1 1.1 0 0 1 1.094.98L18 4.1V7h1a3 3 0 0 1 2.995 2.824L22 10v7a2 2 0 0 1-1.85 1.995L20 19h-2v1.9a1.1 1.1 0 0 1-.98 1.094L16.9 22H7.1a1.1 1.1 0 0 1-1.094-.98L6 20.9V19H4a2 2 0 0 1-1.995-1.85L2 17v-7a3 3 0 0 1 2.824-2.995L5 7h1V4.1a1.1 1.1 0 0 1 .98-1.094L7.1 3zM16 16H8v4h8zm3-7H5a1 1 0 0 0-.993.883L4 10v7h2v-1.9a1.1 1.1 0 0 1 .98-1.094L7.1 14h9.8a1.1 1.1 0 0 1 1.094.98l.006.12V17h2v-7a1 1 0 0 0-1-1m-2 1a1 1 0 0 1 .117 1.993L17 12h-2a1 1 0 0 1-.117-1.993L15 10zm-1-5H8v2h8z"/>
					</svg>
				</button>
			</aside>
		`;
	}

	connectedCallback() {
		const url = window.location.href;
		const title = document.querySelector<HTMLElement>('h1')?.innerText ?? '';
		const description = document.querySelector<HTMLElement>('meta[name="description"]')?.getAttribute('content') ?? 'Check out this page!';

		this.querySelector('#share-os-link')?.addEventListener('click', async () => {
			await navigator.share({
				url,
				title,
				text: description
			});
		});

		this.querySelector('#share-sms')?.addEventListener('click', () => {
			const text = `${title}\n\n${description}\n${url}`;

			window.open(`sms://;?&body=${encodeURIComponent(text)}`);
		});

		this.querySelector('#share-email')?.addEventListener('click', () => {
			const subject = encodeURIComponent(title);
			const body = encodeURIComponent(`${description}\n${url}`);

			window.open(`mailto:?subject=${subject}&body=${body}`);
		});

		this.querySelector('#share-copy')?.addEventListener('click', async () => {
			await navigator.clipboard.writeText(url);
		});

		this.querySelector('#share-print')?.addEventListener('click', () => {
			window.print();
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('share-options')) {
	customElements.define('share-options', ShareOptions);
}
