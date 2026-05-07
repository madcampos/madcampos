/* eslint-disable id-length, @typescript-eslint/no-magic-numbers */

import styles from './wheel-of-fortune.css?url';

type DisplayMode = 'list' | 'wheel';

export class WheelOffortune extends HTMLElement implements CustomElement {
	#animation?: Animation;
	#prevEndDeg = 0;
	#audioCtx?: AudioContext;

	#playTick(progress: number) {
		if (!window.AudioContext) {
			return;
		}

		this.#audioCtx ??= new window.AudioContext();

		if (this.#audioCtx.state === 'suspended') {
			void this.#audioCtx.resume();
		}

		const oscillator = this.#audioCtx.createOscillator();
		const gainNode = this.#audioCtx.createGain();

		const steps = [
			{ frequency: 880, volume: 0.2 },
			{ frequency: 830.61, volume: 0.18 },
			{ frequency: 783.99, volume: 0.16 },
			{ frequency: 739.99, volume: 0.14 },
			{ frequency: 698.46, volume: 0.12 },
			{ frequency: 659.25, volume: 0.1 },
			{ frequency: 622.25, volume: 0.06 },
			{ frequency: 554.37, volume: 0.04 },
			{ frequency: 523.25, volume: 0.02 },
			{ frequency: 493.88, volume: 0.005 },
			{ frequency: 466.16, volume: 0.001 },
			{ frequency: 440, volume: 0.001 }
		];

		const stepIndex = Math.min(progress, steps.length - 1);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const { frequency, volume } = steps[stepIndex]!;
		const duration = 0.1;

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, this.#audioCtx.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(40, this.#audioCtx.currentTime + duration);

		gainNode.gain.setValueAtTime(volume, this.#audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, this.#audioCtx.currentTime + duration);

		oscillator.connect(gainNode);
		gainNode.connect(this.#audioCtx.destination);

		oscillator.start();
		oscillator.stop(this.#audioCtx.currentTime + duration);
	}

	get items() {
		const itemsString = this.getAttribute('items') ?? '';

		return itemsString.split(',').map((item) => item.trim());
	}

	set items(items) {
		this.setAttribute('items', items.join(','));
	}

	#renderWheelSlice(text: string, index: number, total: number) {
		const angleStep = 360 / total;
		const radius = 240;
		const centerX = 250;
		const centerY = 250;

		const startAngle = index * angleStep;
		const endAngle = (index + 1) * angleStep;

		const x1 = centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
		const y1 = centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
		const x2 = centerX + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
		const y2 = centerY + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);
		const largeArcFlag = angleStep > 180 ? 1 : 0;
		const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

		const textAngle = startAngle + angleStep / 2;
		const textX = centerX + radius * 0.7 * Math.cos((Math.PI * (textAngle - 90)) / 180);
		const textY = centerY + radius * 0.7 * Math.sin((Math.PI * (textAngle - 90)) / 180);

		return /* svg */ `
			<g class="wheel-segment">
				<path d="${pathData}" />
				<text
					x="${textX}"
					y="${textY}"
					transform="rotate(${textAngle}, ${textX}, ${textY})"
				>
					${text}
				</text>
			</g>
		`;
	}

	#showResults(winningItem?: string) {
		if (!winningItem) {
			return;
		}

		const winningId = winningItem
			.toLowerCase()
			.replaceAll(' ', '-')
			.replaceAll('&', '-')
			.trim();

		document.location.hash = `#${winningId}`;

		const targetElement = document.querySelector<HTMLDetailsElement>(`#${winningId}`);

		if (targetElement) {
			targetElement.open = true;
		}
	}

	#resetState() {
		if (this.#animation) {
			// TODO: cancel child animations
			this.#animation.cancel();
		}

		this.#prevEndDeg = 0;
		this.querySelector('.wheel')?.removeAttribute('style');

		this.querySelector('.wheel-segment[aria-current]')?.removeAttribute('aria-current');
		this.querySelector('li[aria-current]')?.removeAttribute('aria-current');
	}

	async #spinWheel() {
		this.#resetState();

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const wheel = this.querySelector<SVGGElement>('.wheel')!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const spinner = this.querySelector<SVGGElement>('.wheel-spinner')!;
		const items = this.querySelectorAll('.wheel-segment');

		if (items?.length === 0) {
			return;
		}

		const segmentAngle = 360 / items.length;
		const initialDeg = 5 * 360;
		const randomDeg = Math.trunc(Math.random() * 360) + initialDeg;
		const newEndDeg = this.#prevEndDeg + randomDeg;
		let animationDuration = 4000;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			animationDuration = 1;
		}

		// #region Spin animations
		this.#animation = new Animation(
			new KeyframeEffect(
				wheel,
				[
					{ transform: `rotate(${this.#prevEndDeg}deg)` },
					{ transform: `rotate(${newEndDeg}deg)` }
				],
				{
					duration: animationDuration,
					easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)'
				}
			),
			document.timeline
		);

		const spinnerAnim = new Animation(
			new KeyframeEffect(
				spinner,
				[
					{ transform: 'rotate(0deg)', offset: 0 },
					{ transform: 'rotate(-20deg)', offset: 0.5 },
					{ transform: 'rotate(0deg)', offset: 1 }
				],
				{
					duration: 200,
					iterations: Infinity
				}
			),
			document.timeline
		);
		// #endregion

		this.#animation.play();
		spinnerAnim.play();

		let lastSegmentIndex = -1;

		const checkTick = () => {
			if (!this.#animation || this.#animation.playState === 'finished') {
				return;
			}

			const currentTime = (this.#animation.currentTime as number) || 0;
			const progress = currentTime / animationDuration;
			const currentRotation = this.#prevEndDeg + (randomDeg * progress);
			const currentWinningAngle = 360 - (currentRotation % 360);
			const currentSegmentIndex = Math.floor(currentWinningAngle / segmentAngle);

			if (currentSegmentIndex !== lastSegmentIndex) {
				const stepCount = 12;
				const integerProgress = Math.floor(progress * stepCount);
				this.#playTick(integerProgress);
				lastSegmentIndex = currentSegmentIndex;
			}

			requestAnimationFrame(checkTick);
		};

		requestAnimationFrame(checkTick);

		await this.#animation.finished;
		spinnerAnim.cancel();
		this.#animation?.commitStyles();

		const finalRotation = newEndDeg % 360;
		const winningAngle = 360 - finalRotation;
		const winningIndex = Math.floor(winningAngle / segmentAngle);

		items[winningIndex]?.setAttribute('aria-current', 'true');
		this.#showResults(items[winningIndex]?.textContent);

		this.#prevEndDeg = newEndDeg;
	}

	async #spinList() {
		this.#resetState();

		const items = this.querySelectorAll('li');

		if (items.length === 0) {
			return;
		}

		const winningIndex = Math.trunc(Math.random() * items.length);

		const initialSpins = items.length * 5;
		const totalSpins = initialSpins + winningIndex;

		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			for (let i = 0; i <= totalSpins; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const item = items[i % items.length]!;

				this.#animation = new Animation(
					new KeyframeEffect(
						item,
						[
							{ backgroundColor: 'transparent' },
							{ backgroundColor: 'var(--highlight-bg)', color: 'var(--highlight-color)', offset: 0.15 },
							{ backgroundColor: 'var(--highlight-bg)', color: 'var(--highlight-color)', offset: 0.85 },
							{ backgroundColor: 'transparent' }
						],
						{
							duration: 20 + Math.max(120, 100 + i)
						}
					),
					document.timeline
				);

				this.#animation.play();

				await this.#animation.finished;
			}
		}

		items[winningIndex]?.setAttribute('aria-current', 'true');
		this.#showResults(items[winningIndex]?.textContent);
	}

	#toggleDisplayMode(displayMode: DisplayMode) {
		this.setAttribute('display', displayMode);
	}

	render() {
		const wheelItems = this.items.map((item, index, arr) => this.#renderWheelSlice(item, index, arr.length)).join('\n');
		const listItems = this.items.map((item) => /* html */ `
			<li>${item}</li>
		`).join('\n');

		this.innerHTML = /* html */ `
			<link rel="stylesheet" href={styles} />
			<fieldset>
				<legend>The Wheel of Fork-tune</legend>

				<wheel-container>
					<svg class="wheel-svg" viewBox="0 0 500 500" width="500" height="500">
						<g class="wheel">${wheelItems}</g>

						<circle cx="50%" cy="50%" r="20" />
						<circle cx="50%" cy="50%" r="240" />

						<g class="wheel-spinner">
							<path d="M 250 10 L 230 0 L 250 50 L 270 0 Z" />
							<path d="M 250 10 L 250 50 L 270 0 Z" />
						</g>
					</svg>

					<button type="button" formaction="spin-wheel">Spin the wheel</button>
				</wheel-container>

				<list-container>
					<button type="button" formaction="spin-list">Select from list</button>

					<ol id="items-list">${listItems}</ol>
				</list-container>

				<wheel-display-options>
					<button type="button" formaction="show-list">Show list instead</button>
					<button type="button" formaction="show-wheel">Show wheel instead</button>
				</wheel-display-options>
			</fieldset>
		`;
	}

	async handleEvent(event: Event) {
		if (event.type !== 'click') {
			return;
		}

		if (!(event.target instanceof HTMLButtonElement)) {
			return;
		}

		switch (new URL(event.target.formAction).pathname) {
			case '/spin-wheel':
				await this.#spinWheel();
				break;
			case '/spin-list':
				await this.#spinList();
				break;
			case '/show-list':
				this.#toggleDisplayMode('list');
				break;
			case '/show-wheel':
				this.#toggleDisplayMode('wheel');
				break;
			default:
		}
	}

	connectedCallback() {
		if (!this.items.length) {
			return;
		}

		const tagName = 'wheel-of-fortune';
		if (!document.head.querySelector(`link[rel="stylesheet"][data-component="${tagName}"]`)) {
			document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" fetchpriority="low" data-component="${tagName}" href="${styles}" />`);
		}

		this.render();

		this.#toggleDisplayMode(this.getAttribute('display') as DisplayMode ?? 'wheel');

		this.addEventListener('click', this);
	}

	disconnectedCallback(): Promise<void> | void {
		this.removeEventListener('click', this);
	}
}

if (!customElements.get('wheel-of-fortune')) {
	customElements.define('wheel-of-fortune', WheelOffortune);
}
