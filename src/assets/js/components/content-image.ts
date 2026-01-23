import { SiteSettings } from '../settings.ts';

export class ImageLightbox extends HTMLElement implements CustomElement {
	#inputElement?: HTMLInputElement;
	#outputElement?: HTMLOutputElement;
	#imgZoomElement?: HTMLElement;
	#fullscreenElement?: HTMLElement;
	#fullscreenIconElement?: SVGUseElement;

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

	connectedCallback() {
		const img = this.querySelector<HTMLImageElement>('img');

		if (!img) {
			return;
		}

		const id = Math.trunc(Math.random() * 100000).toString(16);
		const fullscreenButton = document.fullscreenEnabled
			? `
				<hr />

				<button type="button" id="lightbox-fullscreen-button-${id}">
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
					<button type="button" popovertarget="lightbox-alt-dialog-${id}">
						<sr-only>View image alternative text</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-info" width="24" height="24" />
						</svg>
					</button>
					<dialog id="lightbox-alt-dialog-${id}" popover>
						<header>
							<h2>Image Alternative Text</h2>
							<button type="button" popovertarget="lightbox-alt-dialog-${id}">
								<sr-only>Close alternative text</sr-only>
									<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
										<use href="#img-lightbox-icon-close" width="24" height="24" />
									</svg>
							</button>
						</header>
						<dialog-content>
							<p>${img.alt}</p>
						</dialog-content>
					</dialog>

					<button type="button" popovertarget="lightbox-zoom-dialog-${id}">
						<sr-only>View full image</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-open" width="24" height="24" />
						</svg>
					</button>
					<dialog id="lightbox-zoom-dialog-${id}" popover>
						<form action="">
							<header>
								<h2>Full Image</h2>
								<button type="button" popovertarget="lightbox-zoom-dialog-${id}">
									<sr-only>Close full image</sr-only>
										<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
											<use href="#img-lightbox-icon-close" width="24" height="24" />
										</svg>
								</button>
							</header>
							<dialog-content style="zoom: 100%;">
								${img.outerHTML}
							</dialog-content>
							<footer>
								<input-wrapper>
									<label for="lightbox-zoom-level-${id}">Zoom level</label>
									<input-wrapper>
										<input
											id="lightbox-zoom-level-${id}"
											type="range"
											min="10"
											max="500"
											step="10"
											value="100"
										/>
										<input-infix>
											<output for="lightbox-zoom-level-${id}">100%</output>
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
					<button type="button" id="lightbox-download-button-${id}">
						<sr-only>Download Image</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#img-lightbox-icon-download" width="24" height="24" />
						</svg>
					</button>
				</img-lightbox-controls>
			`
		);

		this.#inputElement = this.querySelector(`#lightbox-zoom-dialog-${id} input[type="range"]`) as HTMLInputElement;
		this.#outputElement = this.querySelector(`#lightbox-zoom-dialog-${id} output`) as HTMLOutputElement;
		this.#imgZoomElement = this.querySelector(`#lightbox-zoom-dialog-${id} dialog-content`) as HTMLElement;
		this.#fullscreenIconElement = this.querySelector(`#lightbox-fullscreen-button-${id} use`) as SVGUseElement;
		this.#fullscreenElement = this.querySelector(`#lightbox-zoom-dialog-${id} form`) as HTMLElement;

		this.querySelector<HTMLDialogElement>(`#lightbox-zoom-dialog-${id}`)?.addEventListener('toggle', (evt) => {
			if (evt.newState === 'closed') {
				this.#updateZoom('100');
			}
		});

		this.querySelector<HTMLInputElement>(`#lightbox-zoom-dialog-${id} input[type="range"]`)?.addEventListener('input', (evt) => {
			const target = evt.target as HTMLInputElement;

			this.#updateZoom(target.value);
		});

		this.querySelector<HTMLInputElement>(`#lightbox-zoom-dialog-${id} input[type="range"]`)?.addEventListener('change', (evt) => {
			const target = evt.target as HTMLInputElement;

			this.#updateZoom(target.value);
		});

		this.querySelector<HTMLDialogElement>(`#lightbox-zoom-dialog-${id}`)?.addEventListener('reset', () => {
			this.#updateZoom('100');
		});

		this.querySelector<HTMLDialogElement>(`#lightbox-fullscreen-button-${id}`)?.addEventListener('click', async () => this.#toggleFullscreen());

		document.addEventListener('fullscreenchange', () => {
			if (document.fullscreenElement) {
				this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-enter-fullscreen');
			} else {
				this.#fullscreenIconElement?.setAttribute('href', '#img-lightbox-icon-exit-fullscreen');
			}
		});

		this.querySelector<HTMLDialogElement>(`#lightbox-download-button-${id}`)?.addEventListener('click', () => {
			const link = document.createElement('a');

			link.href = img.src;
			link.download = '';

			document.body.appendChild(link);
			link.click();

			link.remove();
		});
	}
}

if (SiteSettings.js !== 'disabled') {
	if (!customElements.get('img-lightbox')) {
		customElements.define('img-lightbox', ImageLightbox);
	}
}
