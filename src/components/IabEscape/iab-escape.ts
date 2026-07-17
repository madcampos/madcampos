// Ref: https://frontendmasters.com/blog/the-pitfalls-of-in-app-browsers/
import inAppSpy, { SFSVCExperimental as sFSVCExperimental } from 'inapp-spy';
import { loadComponentCss } from '../../assets/js/custom-element.ts';
import { SiteSettings } from '../../assets/js/settings.ts';
import styles from './iab-escape.css?url';

export class IabEscape extends HTMLElement implements CustomElement {
	open() {
		this.querySelector<HTMLDialogElement>('dialog')?.showModal();
	}

	get url() {
		const url = window.location.href;

		let link = `x-safari-${url}`;

		if (navigator.userAgent.includes('Android')) {
			link = `intent:${url}#Intent;end`;
		}

		return link;
	}

	get browserString() {
		if (!navigator.userAgent.includes('Android')) {
			return 'Safari';
		}

		return 'your default browser';
	}

	render() {
		this.innerHTML = `
			<dialog>
				<header>
					<h2>It's a trap!</h2>
				</header>
				<dialog-content>
					<p>
						Looks like you are reading this from an In-App Browser.
						<br />
						Those are "browsers" inside an app like Facebook or Instagram.
					</p>
					<p>Click the link below to try and open this page in ${this.browserString}.</p>
					<p>Or click the button to dismiss this message.</p>
				</dialog-content>
				<footer>
					<a href="${this.url}" target="_blank">Open in ${this.browserString}</a>
					<button type="button">Dismiss Warning</button>
				</footer>
			</dialog>
		`;
	}

	async connectedCallback() {
		await loadComponentCss('iab-escape', styles);

		this.render();

		const { isInApp } = inAppSpy();
		const isSFSVC = await sFSVCExperimental();

		if ((isInApp || isSFSVC) && !SiteSettings.hideIabWarning) {
			this.open();
		}

		if (SiteSettings.iabEscape) {
			this.open();
		}

		this.querySelector('footer button')?.addEventListener('click', () => {
			this.querySelector<HTMLDialogElement>('dialog')?.close();
			SiteSettings.hideIabWarning = true;
		});
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('iab-escape')) {
	customElements.define('iab-escape', IabEscape);
}
