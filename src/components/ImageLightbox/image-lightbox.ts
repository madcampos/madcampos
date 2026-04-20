import { SiteSettings } from '../../assets/js/settings.ts';
import styles from './img-lightbox.css?url';

export class ImageLightbox extends HTMLElement implements CustomElement {
	readonly #id = crypto.randomUUID();

	#image?: HTMLImageElement;

	#dialogElement?: HTMLDialogElement;
	#inputElement?: HTMLInputElement;
	#outputElement?: HTMLOutputElement;
	#imgZoomElement?: HTMLElement;
	#fullscreenElement?: HTMLElement;
	#fullscreenIconElement?: SVGUseElement;
	#fullscreenButton?: HTMLButtonElement;
	#downloadButton?: HTMLButtonElement;

	constructor() {
		super();

		this.#image = this.querySelector<HTMLImageElement>('img') ?? undefined;

		if (!this.#image) {
			return;
		}

		const fullscreenButton = document.fullscreenEnabled
			? `
				<hr />

				<button type="button" id="lightbox-fullscreen-button-${this.#id}">
					<sr-only>Show image in fullscreen</sr-only>
					<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
						<use href="#img-lightbox-icon-enter-fullscreen" width="24" height="24" />
					</svg>
				</button>
			`
			: '';

		this.insertAdjacentHTML(
			'beforeend',
			`
				<img-lightbox-controls>
					<button type="button" popovertarget="lightbox-alt-dialog-${this.#id}">
						<sr-only>View image alternative text</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-info" width="24" height="24" />
						</svg>
					</button>
					<dialog id="lightbox-alt-dialog-${this.#id}" popover>
						<header>
							<h2>Image Alternative Text</h2>
							<button type="button" popovertarget="lightbox-alt-dialog-${this.#id}">
								<sr-only>Close alternative text</sr-only>
									<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
										<use href="#img-lightbox-icon-close" width="24" height="24" />
									</svg>
							</button>
						</header>
						<dialog-content>
							<p>${this.#image.alt}</p>
						</dialog-content>
					</dialog>

					<button type="button" popovertarget="lightbox-zoom-dialog-${this.#id}">
						<sr-only>View full image</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-open" width="24" height="24" />
						</svg>
					</button>
					<dialog id="lightbox-zoom-dialog-${this.#id}" popover>
						<form action="">
							<header>
								<h2>Full Image</h2>
								<button type="button" popovertarget="lightbox-zoom-dialog-${this.#id}">
									<sr-only>Close full image</sr-only>
										<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
											<use href="#img-lightbox-icon-close" width="24" height="24" />
										</svg>
								</button>
							</header>
							<dialog-content style="zoom: 100%;">
								${this.#image.outerHTML}
							</dialog-content>
							<footer>
								<input-wrapper>
									<label for="lightbox-zoom-level-${this.#id}">Zoom level</label>
									<input-wrapper>
										<input
											id="lightbox-zoom-level-${this.#id}"
											type="range"
											min="10"
											max="500"
											step="10"
											value="100"
										/>
										<input-infix>
											<output for="lightbox-zoom-level-${this.#id}">100%</output>
										</input-infix>
									</input-wrapper>
								</input-wrapper>

								<button type="reset">
									<sr-only>Reset zoom</sr-only>
									<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
										<use href="#img-lightbox-icon-reset-zoom" width="24" height="24" />
									</svg>
								</button>

								${fullscreenButton}
							</footer>
						</form>
					</dialog>
					<button type="button" id="lightbox-download-button-${this.#id}">
						<sr-only>Download Image</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-download" width="24" height="24" />
						</svg>
					</button>
				</img-lightbox-controls>
			`
		);
	}
	#updateZoom(newValue: string) {
		if (!this.#inputElement || !this.#outputElement || !this.#imgZoomElement) {
			return;
		}

		this.#inputElement.value = newValue;
		this.#outputElement.value = `${this.#inputElement.value}%`;
		this.#imgZoomElement.style.zoom = `${this.#inputElement.value}%`;
	}

	async #toggleFullscreen() {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
			this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-enter-fullscreen');
		} else {
			await this.#fullscreenElement?.requestFullscreen();
			this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-exit-fullscreen');
		}
	}

	#downloadImage() {
		const link = document.createElement('a');

		link.href = this.#image?.src ?? '';
		link.download = '';

		document.body.appendChild(link);
		link.click();

		link.remove();
	}

	async handleEvent(evt: Event) {
		switch (evt.type) {
			case 'input':
			case 'change':
				this.#updateZoom((evt.target as HTMLInputElement).value);
				break;
			case 'toggle':
				if ((evt as ToggleEvent).newState === 'closed') {
					this.#updateZoom('100');
				}
				break;
			case 'reset':
				this.#updateZoom('100');
				break;
			case 'fullscreenchange':
				if (document.fullscreenElement) {
					this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-enter-fullscreen');
				} else {
					this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-exit-fullscreen');
				}
				break;
			case 'click':
				if ((evt.target as HTMLElement).id === this.#fullscreenButton?.id) {
					await this.#toggleFullscreen();
				} else if ((evt.target as HTMLElement).id === this.#downloadButton?.id) {
					this.#downloadImage();
				}
				break;
			default:
		}
	}

	connectedCallback() {
		if (!this.#image) {
			return;
		}

		const tagName = 'img-lightbox';
		if (!document.head.querySelector(`link[rel="stylesheet"][data-component="${tagName}"]`)) {
			document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" fetchpriority="low" data-component="${tagName}" href="${styles}" />`);
		}

		this.#inputElement = this.querySelector(`#lightbox-zoom-dialog-${this.#id} input[type="range"]`) as HTMLInputElement;
		this.#outputElement = this.querySelector(`#lightbox-zoom-dialog-${this.#id} output`) as HTMLOutputElement;
		this.#imgZoomElement = this.querySelector(`#lightbox-zoom-dialog-${this.#id} dialog-content`) as HTMLElement;
		this.#fullscreenIconElement = this.querySelector(`#lightbox-fullscreen-button-${this.#id} use`) as SVGUseElement;
		this.#fullscreenElement = this.querySelector(`#lightbox-zoom-dialog-${this.#id} form`) as HTMLElement;
		this.#dialogElement = this.querySelector(`#lightbox-zoom-dialog-${this.#id}`) as HTMLDialogElement;
		this.#fullscreenButton = this.querySelector(`#lightbox-fullscreen-button-${this.#id}`) as HTMLButtonElement;
		this.#downloadButton = this.querySelector(`#lightbox-download-button-${this.#id}`) as HTMLButtonElement;

		this.#dialogElement?.addEventListener('toggle', this);
		this.#inputElement?.addEventListener('input', this);
		this.#inputElement?.addEventListener('change', this);
		this.#dialogElement?.addEventListener('reset', this);
		this.#fullscreenButton?.addEventListener('click', this);
		this.#downloadButton?.addEventListener('click', this);

		document.addEventListener('fullscreenchange', this);
	}

	disconnectedCallback() {
		this.#dialogElement?.removeEventListener('toggle', this);
		this.#inputElement?.removeEventListener('input', this);
		this.#inputElement?.removeEventListener('change', this);
		this.#dialogElement?.removeEventListener('reset', this);
		this.#fullscreenButton?.removeEventListener('click', this);
		this.#downloadButton?.removeEventListener('click', this);

		document.removeEventListener('fullscreenchange', this);
	}
}

if (SiteSettings.js !== 'disabled') {
	if (!customElements.get('img-lightbox')) {
		customElements.define('img-lightbox', ImageLightbox);
	}
}
