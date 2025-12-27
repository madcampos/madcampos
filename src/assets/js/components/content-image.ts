import { SiteSettings } from '../settings.ts';

export class ImageLightbox extends HTMLElement implements CustomElement {
	#updateZoom(id: string, newValue: string) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const input = this.querySelector<HTMLOutputElement>(`#lightbox-zoom-dialog-${id} input[type="range"]`)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const output = this.querySelector<HTMLOutputElement>(`#lightbox-zoom-dialog-${id} output`)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const div = this.querySelector<HTMLDivElement>(`#lightbox-zoom-dialog-${id} div`)!;

		input.value = newValue;
		output.value = `${input.value}%`;
		div.style.zoom = `${input.value}%`;
	}
	connectedCallback() {
		const img = this.querySelector<HTMLImageElement>('img');

		if (!img) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		const id = Math.trunc(Math.random() * 100000).toString(16);

		this.insertAdjacentHTML(
			'beforeend',
			`
				<button type="button" class="lightbox-alt" popovertarget="lightbox-alt-dialog-${id}">
					<sr-only>View image alternative text</sr-only>
					<svg data-icon="mingcute:information-line" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m-.01 6c.558 0 1.01.452 1.01 1.01v5.124A1 1 0 0 1 12.5 18h-.49A1.01 1.01 0 0 1 11 16.99V12a1 1 0 1 1 0-2zM12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/>
					</svg>
				</button>
				<dialog id="lightbox-alt-dialog-${id}" popover>
					<header>
						<h2>Image Alternative Text</h2>
						<button type="button" popovertarget="lightbox-alt-dialog-${id}">
							<sr-only>Close alternative text</sr-only>
							<svg data-icon="mingcute:close-line" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
								<path fill="currentColor" d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414z"/>
							</svg>
						</button>
					</header>
					<div>
						<p>${img.alt}</p>
					</div>
				</dialog>

				<button type="button" class="lightbox-zoom" popovertarget="lightbox-zoom-dialog-${id}">
					<sr-only>View full image</sr-only>
					<svg data-icon="mingcute:add-circle-line" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 3a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1"/>
					</svg>
				</button>
				<dialog id="lightbox-zoom-dialog-${id}" popover>
					<header>
						<h2>Full Image</h2>
						<button type="button" popovertarget="lightbox-zoom-dialog-${id}">
							<sr-only>Close full image</sr-only>
							<svg data-icon="mingcute:close-line" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
								<path fill="currentColor" d="m12 13.414l5.657 5.657a1 1 0 0 0 1.414-1.414L13.414 12l5.657-5.657a1 1 0 0 0-1.414-1.414L12 10.586L6.343 4.929A1 1 0 0 0 4.93 6.343L10.586 12l-5.657 5.657a1 1 0 1 0 1.414 1.414z"/>
							</svg>
						</button>
					</header>
					<div style="zoom: 100%;">
						${img.outerHTML}
					</div>
					<footer>
						<form action="">
							<span>
								<label for="lightbox-zoom-level-${id}">Zoom level</label>
								<input
									id="lightbox-zoom-level-${id}"
									type="range"
									min="10"
									max="500"
									step="10"
									value="100"
								/>
								<output for="lightbox-zoom-level-${id}">100%</output>
							</span>

							<button type="reset">
								<sr-only>Reset zoom</sr-only>
								<svg data-icon="mingcute:refresh-anticlockwise-1-line" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
									<path fill="currentColor" d="M14.07 19.727a8 8 0 0 1-9.146-3.99a1 1 0 0 0-1.77.933c2.13 4.04 6.836 6.221 11.434 4.99c5.335-1.43 8.5-6.914 7.071-12.248c-1.43-5.335-6.913-8.5-12.247-7.071a10 10 0 0 0-7.414 9.58c-.007.903.995 1.402 1.713.919l2.673-1.801c1.008-.68.332-2.251-.854-1.986l-1.058.236a8 8 0 1 1 9.598 10.439Z"/>
								</svg>
							</button>
						</form>
					</footer>
				</dialog>
			`
		);

		this.querySelector<HTMLDialogElement>(`#lightbox-zoom-dialog-${id}`)?.addEventListener('toggle', (evt) => {
			if (evt.newState === 'closed') {
				this.#updateZoom(id, '100');
			}
		});

		this.querySelector<HTMLInputElement>(`#lightbox-zoom-dialog-${id} input[type="range"]`)?.addEventListener('input', (evt) => {
			const target = evt.target as HTMLInputElement;

			this.#updateZoom(id, target.value);
		});

		this.querySelector<HTMLInputElement>(`#lightbox-zoom-dialog-${id} input[type="range"]`)?.addEventListener('change', (evt) => {
			const target = evt.target as HTMLInputElement;

			this.#updateZoom(id, target.value);
		});

		this.querySelector<HTMLDialogElement>(`#lightbox-zoom-dialog-${id}`)?.addEventListener('reset', () => {
			this.#updateZoom(id, '100');
		});
	}
}

if (SiteSettings.js !== 'disabled') {
	document.querySelectorAll<HTMLImageElement>('rendered-content img').forEach((img) => {
		const lightbox = document.createElement('img-lightbox');

		img.replaceWith(lightbox);
		lightbox.appendChild(img);
	});

	if (!customElements.get('img-lightbox')) {
		customElements.define('img-lightbox', ImageLightbox);
	}
}
