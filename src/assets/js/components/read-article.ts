import { SiteSettings } from '../settings.ts';

interface SectionUtterance {
	node: Node;
	utterance: SpeechSynthesisUtterance;
}

class ReadArticle extends HTMLElement implements CustomElement {
	#id = Math.trunc(Math.random() * 100000).toString(16);

	#sections: SectionUtterance[] = [];
	#highlight = new Highlight();
	#currentSection = 0;

	#listVoices() {
		const displayNames = new Intl.DisplayNames('en-CA', { type: 'language', fallback: 'code' });
		const collator = new Intl.Collator('en-CA', { usage: 'sort' });
		const pageLocale = new Intl.Locale(document.documentElement.lang);

		const voices = Object.fromEntries(
			Object.entries(Object.groupBy(
				speechSynthesis.getVoices()
					.filter((voice) =>
						voice.default ||
						voice.name === SiteSettings.readingVoice ||
						navigator.languages.includes(voice.lang) ||
						new Intl.Locale(voice.lang).language === pageLocale.language
					),
				(voice) => displayNames.of(voice.lang) ?? voice.lang
			))
				.map(([lang, unsortedVoiceList]) => [
					lang,
					Object.fromEntries(
						Object.entries(Object.groupBy(
							unsortedVoiceList ?? [],
							(voice) => voice.localService ? 'Local Voice' : 'Online Voice'
						))
							.map(([title, voiceList]) => [
								title,
								voiceList.sort(({ name: nameA }, { name: nameB }) => collator.compare(nameA, nameB))
							])
					)
				])
		);

		return Object.entries(voices)
			.map(([lang, voiceAvailabilityList]) => `
				<optgroup label="${lang}">
					${
				Object.entries(voiceAvailabilityList).map(([availability, voiceList]) => `
						<optgroup label="${availability}">
							${voiceList.map((voice) => `<option ${SiteSettings.readingVoice === voice.name || voice.default ? 'selected' : ''}>${voice.name}</option>`).join('\n')}
						</optgroup>
					`).join('\n')
			}
				</optgroup>
			`)
			.join('\n');
	}

	#buildSections() {
		const elementRoot = document.querySelector<HTMLElement>('main > rendered-content');

		if (!elementRoot) {
			return;
		}

		const treeWalker = document.createTreeWalker(elementRoot, NodeFilter.SHOW_TEXT);

		while (treeWalker.nextNode()) {
			const { currentNode } = treeWalker;
			const { textContent } = currentNode;

			if (!textContent?.trim()) {
				continue;
			}

			if (currentNode.parentElement?.matches('sr-only')) {
				continue;
			}

			const isImageLightboxChild = Boolean(currentNode.parentElement?.closest('img-lightbox'));
			const isImageLightboxContent = Boolean(currentNode.parentElement?.closest('img-lightbox dialog-content'));
			if (isImageLightboxChild && !isImageLightboxContent) {
				continue;
			}

			this.#sections.push({
				utterance: this.#newUtterance(currentNode),
				node: currentNode
			});
		}
	}

	#newUtterance(node: Node) {
		const utterance = new SpeechSynthesisUtterance(node.textContent ?? undefined);

		utterance.lang = document.documentElement.lang;
		utterance.rate = SiteSettings.readingSpeed;

		const voices = speechSynthesis.getVoices();
		const selectedVoice = voices.find((voice) => voice.name === SiteSettings.readingVoice) ?? voices.find((voice) => voice.default);

		if (selectedVoice) {
			utterance.voice = selectedVoice;
		}

		utterance.addEventListener('boundary', this);
		utterance.addEventListener('end', this);

		return utterance;
	}

	#nextSection() {
		if (this.#currentSection < this.#sections.length) {
			this.#currentSection += 1;

			const utterance = this.#sections[this.#currentSection]?.utterance;

			if (utterance) {
				speechSynthesis.speak(utterance);
			}
		} else {
			this.#currentSection = 0;
		}
	}

	#highlightWord(evt: SpeechSynthesisEvent) {
		if (!('highlights' in CSS)) {
			return;
		}

		if (evt.name !== 'word') {
			return;
		}

		const currentNode = this.#sections[this.#currentSection]?.node;

		if (!currentNode) {
			return;
		}

		const range = new Range();

		range.setStart(currentNode, evt.charIndex);
		range.setEnd(currentNode, evt.charIndex + evt.charLength);
		this.#highlight.clear();
		this.#highlight.add(range);
	}

	#toggleReading(button: HTMLButtonElement) {
		if (speechSynthesis.speaking) {
			speechSynthesis.pause();
			button.textContent = 'Read Article';
		} else if (this.#currentSection === 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			speechSynthesis.speak(this.#sections[0]!.utterance);
			button.textContent = 'Pause Reading';
		} else {
			speechSynthesis.resume();
			button.textContent = 'Pause Reading';
		}
	}

	#setVoice(newVoice: string) {
		SiteSettings.readingVoice = newVoice;

		const wasSpeeking = speechSynthesis.speaking;
		if (wasSpeeking) {
			speechSynthesis.pause();
		}

		const voices = speechSynthesis.getVoices();
		const selectedVoice = voices.find((voice) => voice.name === SiteSettings.readingVoice) ?? voices.find((voice) => voice.default);

		if (selectedVoice) {
			this.#sections.forEach(({ utterance }) => {
				utterance.voice = selectedVoice;
			});
		}

		if (wasSpeeking) {
			speechSynthesis.resume();
		}
	}

	#setSpeed(newSpeed: number) {
		if (Number.isNaN(newSpeed)) {
			return;
		}

		SiteSettings.readingSpeed = newSpeed;

		const wasSpeeking = speechSynthesis.speaking;
		if (wasSpeeking) {
			speechSynthesis.pause();
		}

		this.#sections.forEach(({ utterance }) => {
			utterance.rate = newSpeed;
		});

		if (wasSpeeking) {
			speechSynthesis.resume();
		}
	}

	#updateSpeechSetting(evt: InputEvent) {
		if (evt.target instanceof HTMLInputElement) {
			this.#setSpeed(Number.parseFloat(evt.target.value));
		} else if (evt.target instanceof HTMLSelectElement) {
			this.#setVoice(evt.target.value);
		}
	}

	#handleClick(evt: MouseEvent) {
		if (!(evt.target instanceof HTMLButtonElement)) {
			return;
		}

		switch (evt.target.name) {
			case 'read-article':
				this.#toggleReading(evt.target);
				break;
			default:
		}
	}

	handleEvent(evt: Event) {
		switch (evt.type) {
			case 'boundary':
				this.#highlightWord(evt as SpeechSynthesisEvent);
				break;
			case 'end':
				this.#nextSection();
				break;
			case 'submit':
				evt.preventDefault();
				evt.stopPropagation();
				break;
			case 'click':
				this.#handleClick(evt as MouseEvent);
				break;
			case 'input':
			case 'change':
				this.#updateSpeechSetting(evt as unknown as InputEvent);
				break;
			default:
		}
	}

	render() {
		this.innerHTML = `
			<form action="" method="post">
				<details open>
					<summary>Read Article</summary>
					<div>
						<input-wrapper>
							<label for="voice-list-${this.#id}">Voice</label>
							<select name="voice" id="voice-list-${this.#id}">
								${this.#listVoices()}
							</select>
						</input-wrapper>

						<input-wrapper>
							<label for="voice-speed-${this.#id}">Speed</label>
							<input
								name="voice-speed"
								id="voice-speed-${this.#id}"
								type="number"
								min="0.5"
								step="0.1"
								max="3"
								value="${SiteSettings.readingSpeed}"
							/>
						</input-wrapper>
						<button type="button" name="read-article">Read article</button>
					</div>
				</details>
			</form>
		`;
	}

	connectedCallback() {
		if (!('speechSynthesis' in window) || !('highlights' in CSS)) {
			return;
		}

		speechSynthesis.cancel();

		speechSynthesis.addEventListener('voiceschanged', () => {
			this.#buildSections();
			this.render();
		}, { once: true });

		CSS.highlights.set('reading-highlight', this.#highlight);

		this.addEventListener('input', this);
		this.addEventListener('change', this);
		this.addEventListener('click', this);
	}

	disconnectedCallback() {
		speechSynthesis.cancel();

		this.#sections.forEach(({ utterance }) => {
			utterance.removeEventListener('boundary', this);
			utterance.removeEventListener('end', this);
		});

		this.removeEventListener('input', this);
		this.removeEventListener('change', this);
		this.removeEventListener('click', this);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('read-article')) {
	customElements.define('read-article', ReadArticle);
}
