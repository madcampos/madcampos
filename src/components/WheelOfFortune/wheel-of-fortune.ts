// oxlint-disable no-magic-numbers id-length
import { type WheelOfFortuneDisplaySetting, SiteSettings } from '../../assets/js/settings.ts';
import styles from './wheel-of-fortune.css?url';

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s_-]/gu, '')
		.replace(/\s+/gu, '-')
		.replace(/-+/gu, '-')
		.replace(/^-+|-+$/gu, '');
}

export class WheelOffortune extends HTMLElement implements CustomElement {
	readonly #id = crypto.randomUUID();

	#animation?: Animation;
	#prevEndDeg = 0;
	#audioCtx?: AudioContext;

	async #playClick(progress: number) {
		// oxlint-disable-next-line typescript/no-unnecessary-condition
		if (!window.AudioContext) {
			return;
		}

		this.#audioCtx ??= new window.AudioContext();

		if (this.#audioCtx.state === 'suspended') {
			await this.#audioCtx.resume();
		}

		const gainNode = this.#audioCtx.createGain();

		const baseFrequency = 200 - (100 * progress);
		const frequencies = [baseFrequency, baseFrequency * 1.25, baseFrequency * 1.5];
		const volume = 0.1 * (1 - progress);
		const duration = 0.05 + (0.15 * progress);

		gainNode.gain.setValueAtTime(volume, this.#audioCtx.currentTime);
		gainNode.gain.linearRampToValueAtTime(0, this.#audioCtx.currentTime + duration);
		gainNode.connect(this.#audioCtx.destination);

		for (const freq of frequencies) {
			const oscillator = this.#audioCtx.createOscillator();
			oscillator.type = 'sawtooth';
			oscillator.frequency.setValueAtTime(freq, this.#audioCtx.currentTime);
			oscillator.frequency.exponentialRampToValueAtTime(40, this.#audioCtx.currentTime + duration);
			oscillator.connect(gainNode);
			oscillator.start();
			oscillator.stop(this.#audioCtx.currentTime + duration);
		}
	}

	async #playDing(frequency: number, delay: number) {
		// oxlint-disable-next-line typescript/no-unnecessary-condition
		if (!window.AudioContext) {
			return;
		}

		this.#audioCtx ??= new window.AudioContext();

		if (this.#audioCtx.state === 'suspended') {
			await this.#audioCtx.resume();
		}

		const oscillator = this.#audioCtx.createOscillator();
		const gainNode = this.#audioCtx.createGain();

		const startTime = this.#audioCtx.currentTime + delay;
		const duration = 0.5;

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, startTime);

		gainNode.gain.setValueAtTime(0, startTime);
		gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
		gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

		oscillator.connect(gainNode);
		gainNode.connect(this.#audioCtx.destination);

		oscillator.start(startTime);
		oscillator.stop(startTime + duration);
	}

	async #playWinningSound() {
		// INFO: A5 -> B5 -> D6 -> E6 -> G6
		await this.#playDing(880, 0);
		await this.#playDing(987.77, 0.2);
		await this.#playDing(1174.66, 0.4);
		await this.#playDing(1318.51, 0.6);
		await this.#playDing(1567.98, 0.8);
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

		const winningId = slugify(winningItem);

		document.location.hash = `#${winningId}`;

		const targetElement = document.querySelector<HTMLDetailsElement>(`#${winningId}`);

		if (targetElement) {
			targetElement.open = true;
		}
	}

	#resetState() {
		this.#prevEndDeg = 0;
		this.querySelector('.wheel')?.removeAttribute('style');

		this.querySelector('.wheel-segment[aria-current]')?.removeAttribute('aria-current');
		this.querySelector('li[aria-current]')?.removeAttribute('aria-current');
	}

	async #spinWheel() {
		this.#resetState();
		this.#animation?.cancel();

		// oxlint-disable-next-line typescript/no-non-null-assertion
		const wheel = this.querySelector<SVGGElement>('.wheel')!;
		// oxlint-disable-next-line typescript/no-non-null-assertion
		const spinner = this.querySelector<SVGGElement>('.wheel-spinner')!;
		const items = this.querySelectorAll('.wheel-segment');

		if (items.length === 0) {
			return;
		}

		const segmentAngle = 360 / items.length;
		const initialDeg = 5 * 360;
		const randomDeg = Math.trunc(Math.random() * 360) + initialDeg;
		const newEndDeg = this.#prevEndDeg + randomDeg;
		let animationDuration = 4000;

		if (SiteSettings.wheelOfFortuneAnimation === 'disabled') {
			animationDuration = 0;
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

		this.#animation.addEventListener('cancel', () => spinnerAnim.cancel(), { once: true });
		// #endregion

		this.#animation.play();
		spinnerAnim.play();

		let lastSegmentIndex = -1;

		const checkTick = () => {
			if (!this.#animation || this.#animation.playState === 'finished') {
				return;
			}

			// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
			const currentTime = (this.#animation.currentTime as number) || 0;
			const progress = currentTime / animationDuration;
			const currentRotation = this.#prevEndDeg + (randomDeg * progress);
			const currentWinningAngle = 360 - (currentRotation % 360);
			const currentSegmentIndex = Math.floor(currentWinningAngle / segmentAngle);

			if (currentSegmentIndex !== lastSegmentIndex) {
				void this.#playClick(progress);
				lastSegmentIndex = currentSegmentIndex;
			}

			requestAnimationFrame(checkTick);
		};

		requestAnimationFrame(checkTick);

		await this.#animation.finished;
		spinnerAnim.cancel();
		this.#animation.commitStyles();

		const finalRotation = newEndDeg % 360;
		const winningAngle = 360 - finalRotation;
		const winningIndex = Math.floor(winningAngle / segmentAngle);

		items[winningIndex]?.setAttribute('aria-current', 'true');
		this.#showResults(items[winningIndex]?.textContent);
		await this.#playWinningSound();

		this.#prevEndDeg = newEndDeg;
	}

	async #spinList() {
		this.#resetState();
		this.#animation?.cancel();

		const items = this.querySelectorAll('li');

		if (items.length === 0) {
			return;
		}

		const winningIndex = Math.trunc(Math.random() * items.length);

		const initialSpins = items.length * 5;
		const totalSpins = initialSpins + winningIndex;

		if (SiteSettings.wheelOfFortuneAnimation === 'enabled') {
			for (let i = 0; i <= totalSpins; i++) {
				// oxlint-disable-next-line typescript/no-non-null-assertion
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

				this.#animation.addEventListener('cancel', () => {
					i = Infinity;
				}, { once: true });

				this.#animation.play();

				void this.#playClick(i / totalSpins);

				// oxlint-disable-next-line no-await-in-loop
				await this.#animation.finished;
			}
		}

		items[winningIndex]?.setAttribute('aria-current', 'true');
		this.#showResults(items[winningIndex]?.textContent);
		await this.#playWinningSound();
	}

	#toggleDisplayMode(displayMode: WheelOfFortuneDisplaySetting) {
		this.setAttribute('display', displayMode);
		this.#resetState();
		requestAnimationFrame(() => this.#animation?.cancel());
		SiteSettings.wheelOfFortuneDisplay = displayMode;
	}

	#handleToggleAnimations() {
		const checkbox = this.querySelector<HTMLInputElement>('input[type="checkbox"]');

		if (!checkbox) {
			return;
		}

		SiteSettings.wheelOfFortuneAnimation = checkbox.checked ? 'disabled' : 'enabled';
	}

	render() {
		const wheelItems = this.items.map((item, index, arr) => this.#renderWheelSlice(item, index, arr.length)).join('\n');
		const listItems = this.items.map((item) => /* html */ `
			<li>${item}</li>
		`).join('\n');

		this.innerHTML = /* html */ `
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

					<button type="button" command="--spin-wheel">Spin the wheel</button>
				</wheel-container>

				<list-container>
					<button type="button" command="--spin-list">Select from list</button>

					<ol id="items-list">${listItems}</ol>
				</list-container>

				<wheel-display-options>
					<button type="button" command="--show-list">Show list instead</button>
					<button type="button" command="--show-wheel">Show wheel instead</button>
				</wheel-display-options>
				<input-wrapper>
					<input
						type="checkbox"
						${SiteSettings.wheelOfFortuneAnimation === 'enabled' ? '' : 'checked'}
						name="wheel-animation"
						id="wheel-animation-${this.#id}"
					/>
					<label for="wheel-animation-${this.#id}">Disable wheel/list animation</label>
				</input-wrapper>
			</fieldset>
		`;
	}

	async handleEvent(event: Event) {
		switch (event.type) {
			case 'input':
			case 'change':
				this.#handleToggleAnimations();
				break;
			default:
		}

		if (event.type === 'click' && event.target instanceof HTMLButtonElement) {
			switch (event.target.getAttribute('command') ?? '') {
				case '--spin-wheel':
					await this.#spinWheel();
					break;
				case '--spin-list':
					await this.#spinList();
					break;
				case '--show-list':
					this.#toggleDisplayMode('list');
					break;
				case '--show-wheel':
					this.#toggleDisplayMode('wheel');
					break;
				default:
			}
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

		// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
		const attributeDisplay = this.getAttribute('display') as WheelOfFortuneDisplaySetting | null;
		this.#toggleDisplayMode(attributeDisplay ?? SiteSettings.wheelOfFortuneDisplay);

		this.addEventListener('click', this);
		this.addEventListener('input', this);
		this.addEventListener('change', this);
	}

	disconnectedCallback(): Promise<void> | void {
		this.removeEventListener('click', this);
		this.removeEventListener('input', this);
		this.removeEventListener('change', this);
	}
}

if (SiteSettings.js !== 'disabled') {
	if (!customElements.get('wheel-of-fortune')) {
		customElements.define('wheel-of-fortune', WheelOffortune);
	}
}
