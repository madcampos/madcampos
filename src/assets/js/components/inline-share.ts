import { SiteSettings } from '../settings.ts';

export class InlineShare extends HTMLElement implements CustomElement {
	readonly #MIN_WORDS_FOR_SHARING = 3;
	readonly #MAX_WORDS_FOR_SHARING = 25;

	readonly #TEXT_BOX_WIDTH = 980;
	readonly #TEXT_BOX_TOP_OFFSET = 50;
	readonly #TEXT_BOX_LINE_HEIGHT = 60;

	#id: string;

	#segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
	#overlay: HTMLElement;
	#canvas: HTMLCanvasElement;
	#canvasContext: CanvasRenderingContext2D;

	constructor() {
		super();

		this.#id = Math.trunc(Math.random() * 100000).toString(16);
		this.hidden = true;

		this.innerHTML = `
			<share-overlay></share-overlay>
			<button type="button" popovertarget="dialog-${this.#id}" popoveraction="open">
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
					<use href="#share-icon-share" width="24" height="24" />
				</svg>
				<span>Share quote</span>
			</button>
			<dialog id="dialog-${this.#id}" popover>
				<header>
					<h2>Share quote</h2>
					<button type="button" popovertarget="dialog-${this.#id}" popoveraction="close">
						<sr-only>Close quote sharing</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-close" width="24" height="24" />
						</svg>
					</button>
				</header>
				<dialog-content>
					<canvas></canvas>
				</dialog-content>
			</dialog>
		`;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#overlay = this.querySelector('share-overlay')!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#canvas = this.querySelector('canvas')!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#canvasContext = this.#canvas.getContext('2d')!;

		this.#resizeCanvas(1024, 1024);
	}

	#resizeCanvas(width: number, height: number) {
		this.#canvas.width = width;
		this.#canvas.height = height;
		this.#canvasContext.canvas.width = this.#canvas.width;
		this.#canvasContext.canvas.height = this.#canvas.height;
	}

	#drawBackground() {
		const gradient = this.#canvasContext.createLinearGradient(0, 0, this.#canvas.width, this.#canvas.height);
		gradient.addColorStop(0, '#0080ff');
		gradient.addColorStop(1, 'black');

		this.#canvasContext.fillStyle = gradient;
		this.#canvasContext.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
	}

	#drawText(text: string) {
		this.#canvasContext.font = '50px monospace';
		this.#canvasContext.textAlign = 'center';
		this.#canvasContext.fillStyle = 'white';

		const segments = Array.from(this.#segmenter.segment(text));
		const words = segments.slice(0, this.#MAX_WORDS_FOR_SHARING).map((segment) => segment.segment);
		const lines: string[] = [];
		let currentLine = '';
		let currentWidth = 0;

		// TODO: check for spaces and line breaks
		for (const word of words) {
			const wordWidth = this.#canvasContext.measureText(word).width;

			if (currentWidth + wordWidth >= this.#TEXT_BOX_WIDTH) {
				lines.push(currentLine.trim());
				currentLine = `${word} `;
				currentWidth = wordWidth;
			} else {
				currentLine += `${word} `;
				currentWidth += wordWidth;
			}
		}

		if (segments.length > this.#MAX_WORDS_FOR_SHARING) {
			currentLine += '...';
		}

		if (currentLine) {
			lines.push(currentLine.trim());
		}

		let y = this.#TEXT_BOX_TOP_OFFSET;

		for (const line of lines) {
			this.#canvasContext.fillText(line, this.#canvas.width / 2, y, this.#TEXT_BOX_WIDTH);
			y += this.#TEXT_BOX_LINE_HEIGHT;
		}
	}

	#renderToCanvas(text: string) {
		this.#drawBackground();
		this.#drawText(text);
	}

	#resizeOverlay(range: Range) {
		// TODO: compute the correct size based on all of the rects for the range.
		const { top, left, width, height } = range.getBoundingClientRect();
		const { scrollX, scrollY } = window;

		this.#overlay.style.setProperty('--overlay-top', `${top + scrollY}px`);
		this.#overlay.style.setProperty('--overlay-left', `${left + scrollX}px`);
		this.#overlay.style.setProperty('--overlay-width', `${width}px`);
		this.#overlay.style.setProperty('--overlay-height', `${height}px`);
	}

	#handleSelectionChange() {
		const selection = document.getSelection();

		if (!selection) {
			return;
		}

		if (Array.from(this.#segmenter.segment(selection.toString())).length >= this.#MIN_WORDS_FOR_SHARING) {
			this.#resizeOverlay(selection.getRangeAt(0));
			this.#renderToCanvas(selection.toString());

			this.hidden = false;
		} else {
			this.hidden = true;
		}
	}

	handleEvent(evt: Event) {
		if (evt.type === 'selectionchange') {
			this.#handleSelectionChange();
		}
	}

	connectedCallback() {
		document.addEventListener('selectionchange', this);
	}

	disconnectedCallback() {
		document.removeEventListener('selectionchange', this);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('inline-share')) {
	customElements.define('inline-share', InlineShare);
}
