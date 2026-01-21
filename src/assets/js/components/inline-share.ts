import { SiteSettings } from '../settings.ts';

interface DrawTextFontStyle {
	color?: string;
	alignment?: CanvasTextAlign;
	fontFamily?: string;
	style?: 'bold' | 'italic' | 'normal';
	size?: number;
}

export class InlineShare extends HTMLElement implements CustomElement {
	readonly #MIN_WORDS_FOR_SHARING = 3;
	readonly #MAX_WORDS_FOR_SHARING = 30;

	// TODO: calculate sizes as percentage to the total size
	readonly #TEXT_BOX_WIDTH = 950;
	readonly #TEXT_BOX_TOP_OFFSET = 120;

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
				<footer>
					<button type="button" class="share-os-link">
						<sr-only>Share Link to Quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-share" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="share-copy">
						<sr-only>Copy Link to Quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-copy" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="share-email">
						<sr-only>Share via Email</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-email" width="24" height="24" />
						</svg>
					</button>
					<button type="button" class="share-download">
						<sr-only>Download quote</sr-only>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon>
							<use href="#share-icon-download" width="24" height="24" />
						</svg>
					</button>
				</footer>
			</dialog>
		`;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#overlay = this.querySelector('share-overlay')!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#canvas = this.querySelector('canvas')!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.#canvasContext = this.#canvas.getContext('2d')!;

		this.#canvasContext.imageSmoothingEnabled = true;
		this.#canvasContext.imageSmoothingQuality = 'high';

		this.#resizeCanvas(1024, 1024);
	}

	#resizeCanvas(width: number, height: number) {
		this.#canvas.width = width * window.devicePixelRatio;
		this.#canvas.height = height * window.devicePixelRatio;
	}

	#drawBackground() {
		const gradient = this.#canvasContext.createLinearGradient(0, 0, this.#canvas.width, this.#canvas.height);
		gradient.addColorStop(0, '#0080ff');
		gradient.addColorStop(1, 'black');

		this.#canvasContext.fillStyle = gradient;
		this.#canvasContext.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
	}

	#drawText(
		text: string,
		x = this.#canvas.width / 2,
		y = this.#TEXT_BOX_TOP_OFFSET,
		{ fontFamily = "Mecano-Light', 'Mecano', monospace", size = 50, alignment = 'center', color = 'white', style = 'italic' }: DrawTextFontStyle = {}
	) {
		this.#canvasContext.font = `${style} ${size}px ${fontFamily}`;
		this.#canvasContext.textAlign = alignment;
		this.#canvasContext.fillStyle = color;

		const segments = Array.from(this.#segmenter.segment(text));
		const lines: string[] = [];
		let currentLine = '';
		let currentWidth = 0;
		let currentWords = 0;

		for (const segment of segments) {
			if (segment.isWordLike) {
				currentWords += 1;
			}

			if (currentWords > this.#MAX_WORDS_FOR_SHARING) {
				currentLine = `${currentLine.trim()}...`;
				break;
			}

			if (segment.segment === '\n') {
				lines.push(currentLine.trim());
				currentLine = '';
				currentWidth = 0;
			} else {
				const wordWidth = this.#canvasContext.measureText(segment.segment).width;

				if (currentWidth + wordWidth >= this.#TEXT_BOX_WIDTH) {
					lines.push(currentLine.trim());
					currentLine = segment.segment;
					currentWidth = wordWidth;
				} else {
					currentLine += segment.segment;
					currentWidth += wordWidth;
				}
			}
		}

		if (currentLine) {
			lines.push(currentLine.trim());
		}

		const { actualBoundingBoxAscent: ascent, actualBoundingBoxDescent: descent } = this.#canvasContext.measureText('EM');
		const lineHeight = ascent + descent;

		let currentY = y;
		for (const line of lines) {
			this.#canvasContext.fillText(line, x, currentY);
			currentY += lineHeight;
		}
	}

	#renderToCanvas(text: string) {
		this.#drawBackground();

		// TODO: improve styling.
		this.#drawText('Marco Campos', this.#canvas.width - 10, this.#canvas.height - 50, { color: 'red', alignment: 'right', size: 20 });
		this.#drawText(document.title, this.#canvas.width - 10, this.#canvas.height - 20, { color: 'red', alignment: 'right', size: 20 });

		this.#drawText(text);
	}

	#resizeOverlay(range: Range) {
		const { top, left, width, height } = range.getBoundingClientRect();
		const { scrollX, scrollY } = window;

		this.#overlay.style.setProperty('--overlay-top', `${top + scrollY}px`);
		this.#overlay.style.setProperty('--overlay-left', `${left + scrollX}px`);
		this.#overlay.style.setProperty('--overlay-width', `${width}px`);
		this.#overlay.style.setProperty('--overlay-height', `${height}px`);
	}

	#handleSelectionChange() {
		if (this.querySelector('dialog')?.matches(':popover-open')) {
			return;
		}

		this.hidden = true;

		const selection = document.getSelection();

		if (!selection) {
			return;
		}

		if (selection.rangeCount < 1) {
			return;
		}

		const range = selection.getRangeAt(0);
		const ancestor = range.commonAncestorContainer;
		const isRenderedContent = (ancestor as Element)?.matches?.('rendered-content') ?? false;
		const isInsideRenderedContent = Boolean(ancestor.parentElement?.closest('rendered-content'));

		if (!isRenderedContent && !isInsideRenderedContent) {
			return;
		}

		const isCodeBlock = (ancestor as Element)?.matches?.('code-wrapper') ?? false;
		const isInsideCodeBlock = Boolean(ancestor.parentElement?.closest('code-wrapper'));

		if (isCodeBlock || isInsideCodeBlock) {
			return;
		}

		if (Array.from(this.#segmenter.segment(selection.toString())).length >= this.#MIN_WORDS_FOR_SHARING) {
			this.#resizeOverlay(range);
			this.#renderToCanvas(selection.toString());

			this.hidden = false;
		} else {
			this.hidden = true;
		}
	}

	handleEvent(evt: Event) {
		// TODO: add button click events
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
