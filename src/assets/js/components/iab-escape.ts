// Ref: https://frontendmasters.com/blog/the-pitfalls-of-in-app-browsers/
import inAppSpy, { SFSVCExperimental as sFSVCExperimental } from 'inapp-spy';
import { SiteSettings } from '../settings.ts';

export class IabEscape extends HTMLElement implements CustomElement {
	constructor() {
		super();

		this.innerHTML = `
			<dialog>
				<header>
					<h2>It's a trap!</h2>
				</header>
				<dialog-content>
					<p>You are locked inside an In-App Browser.</p>
					<p>
						Those are made to lock you inside a platform and control all your data.
						<br />
						They may promise you privacy, but dont'respect that.
					</p>
					<p>Tap the link below to open this page in your default browser.</p>
				</dialog-content>
				<footer>
					<a href="#" target="_blank">Escape this trap</a>
				</footer>
			</dialog>
		`;
	}

	open() {
		const url = window.location.href;

		let link = `shortcuts://x-callback-url/run-shortcut?name=${crypto.randomUUID()}&x-error=${encodeURIComponent(url)}`;

		if (navigator.userAgent.includes('Android')) {
			link = `intent:${url}#Intent;end`;
		}

		this.querySelector<HTMLDialogElement>('a')?.setAttribute('href', link);
		this.querySelector<HTMLDialogElement>('dialog')?.showModal();
	}

	async connectedCallback() {
		const { isInApp } = inAppSpy();
		const isSFSVC = await sFSVCExperimental();

		if (isInApp || isSFSVC || SiteSettings.iabEscape) {
			this.open();
		}
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('iab-escape')) {
	customElements.define('iab-escape', IabEscape);
}
