// TODO: implement article reading component
// Ref: https://blog.damato.design/_astro/hoisted.C11L7A5c.js
// 1. Get list of voices
// 2. Group list by language, local/online; sort by name; show default first. (hide other languages?)
// 3. Get article elements, split by element type like code or paragraphs
// 4. Infer element language
// 5. Set global pitch, speed, and volume
// 6. Add event to pause on voice change
// 7. Add event for boundaries and implement highlight of word when the boundary change

import { SiteSettings } from '../settings.ts';

// TODO: add global settings for reading code, reading image alt text, etc.

interface WordReference {
	element: HTMLElement;
	range: Range;
}

class ReadArticle extends HTMLElement implements CustomElement {
	#id = Math.trunc(Math.random() * 100000).toString(16);

	// TODO: set multiple utterances due to text size limit
	// TODO: use weak set?
	#utterance = new SpeechSynthesisUtterance('');
	#wordMap: WordReference[] = [];
	#isReading = false;
	#wordIndex = 0;

	#resetUtterance(text: string) {
		speechSynthesis.cancel();

		this.#utterance.removeEventListener('boundary', this);
		this.#utterance.removeEventListener('end', this);
		this.#utterance.removeEventListener('pause', this);
		this.#utterance.removeEventListener('resume', this);
		this.#utterance.removeEventListener('start', this);

		this.#utterance = new SpeechSynthesisUtterance(text);
		this.#utterance.lang = document.documentElement.lang;
		this.#utterance.rate = SiteSettings.readingSpeed;

		const selectedVoice = speechSynthesis.getVoices().find((voice) => voice.name === SiteSettings.readingVoice || voice.default);

		if (selectedVoice) {
			this.#utterance.voice = selectedVoice;
		}

		this.#utterance.addEventListener('boundary', this);
		this.#utterance.addEventListener('end', this);
		this.#utterance.addEventListener('pause', this);
		this.#utterance.addEventListener('resume', this);
		this.#utterance.addEventListener('start', this);
	}

	#buildWordMap() {
		// TODO: gather all elements
		// TODO: break text into words using segmenter api
		// TODO: iterate over the elements creating a list of word ranges.
	}

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

	#highlightWord() {
		if (!('highlighs' in CSS)) {
			return;
		}

		this.#wordIndex += 1;

		CSS.highlights.delete('reading-highlight');
		// TODO: add new highlight
	}

	#toggleReading() {
		if (this.#isReading) {
			speechSynthesis.pause();
			this.#isReading = false;
		} else if (this.#wordIndex === 0) {
			speechSynthesis.speak(this.#utterance);
			this.#isReading = true;
		} else {
			speechSynthesis.resume();
			this.#isReading = true;
		}
	}

	handleEvent(event: Event) {
		if (event instanceof SpeechSynthesisEvent) {
			switch (event.type) {
				case 'boundary':
					break;
				case 'end':
					// TODO: remove event listeners from utterance
					// TODO: cleanup utterances
					break;
				case 'pause':
				case 'start':
				case 'resume':
					this.#toggleReading();
					break;
				case 'submit':
					event.preventDefault();
					event.stopPropagation();
					break;
				case 'click':
					break;
				case 'input':
				case 'change':
					break;
				default:
			}
		}
	}

	render() {
		this.innerHTML = `
			<form action="" method="post">
				<button type="button" name="read-article">Read article</button>
				<fieldset>
					<legend>Reading options</legend>

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
					<button type="button" name="reading-options">Other options</button>
				</fieldset>
			</form>
		`;
	}

	connectedCallback() {
		if (!('speechSynthesis' in window)) {
			return;
		}

		// TODO: add loader

		speechSynthesis.addEventListener('voiceschanged', () => {
			this.render();
		});

		// TODO: hook up button event listeners
		// TODO: hook up input event listeners
	}

	disconnectedCallback() {
		this.#utterance.removeEventListener('boundary', this);
		this.#utterance.removeEventListener('end', this);
		this.#utterance.removeEventListener('pause', this);
		this.#utterance.removeEventListener('resume', this);
		this.#utterance.removeEventListener('start', this);
	}
}

if (SiteSettings.js !== 'disabled' && !customElements.get('read-article')) {
	customElements.define('read-article', ReadArticle);
}
