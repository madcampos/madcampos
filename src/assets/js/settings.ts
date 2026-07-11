// oxlint-disable id-length

export type EnabledDisabledSetting = 'disabled' | 'enabled';
export type ThemeSetting = 'dark' | 'hacker' | 'high-contrast' | 'light' | 'low-contrast' | 'system' | 'uwu' | 'y2k';
export type FontSetting = 'browser' | 'comic-sans' | 'default' | 'legibility';
export type FontSizeSetting = 'large' | 'medium' | 'small' | 'x-large' | 'x-small';
export type LineHeightSetting = 'medium' | 'tight' | 'wide' | 'wider';
export type LetterSpacingSetting = 'medium' | 'tight' | 'tighter' | 'wide' | 'wider';
export type BorderWidthSetting = 'medium' | 'none' | 'thick' | 'thicker' | 'thin';
export type WheelOfFortuneDisplaySetting = 'list' | 'wheel';

export class SiteSettings {
	static AVAILABLE_SETTINGS = [
		'debug',
		'css',
		'js',
		'iabEscape',
		'theme',
		'pwaBanner',
		'logoContextMenu',
		'updateUrl',
		'font',
		'fontSize',
		'lineHeight',
		'letterSpacing',
		'isReducedMotion',
		'hasSolidBorders',
		'borderWidth',
		'readingVoice',
		'readingSpeed',
		'wheelOfFortuneAnimation',
		'wheelOfFortuneDisplay'
	] as const;
	static VOLATILE_SETTINGS: typeof SiteSettings.AVAILABLE_SETTINGS[number][] = ['iabEscape', 'pwaBanner', 'updateUrl'] as const;
	static PERSISTENT_SETTINGS: typeof SiteSettings.AVAILABLE_SETTINGS[number][] = ['theme'] as const;

	static #searchParams?: URLSearchParams;

	static #isCssNakedDay = false;
	static #isJsNakedDay = false;

	static #isInitialized = false;

	static initializeSettings() {
		if (SiteSettings.#searchParams || SiteSettings.#isInitialized) {
			return;
		}

		this.#isInitialized = true;

		SiteSettings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of SiteSettings.AVAILABLE_SETTINGS) {
			SiteSettings.#updateSetting(setting, SiteSettings[setting]?.toString());

			if (this.PERSISTENT_SETTINGS.includes(setting)) {
				SiteSettings.#persistSetting(setting, SiteSettings.#searchParams.get(setting) ?? undefined);
			}
		}

		this.#isCssNakedDay = this.#checkCssNakedDay();
		this.#isJsNakedDay = this.#checkJsNakedDay();
	}

	// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
	static #getSetting<T extends string>(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number]) {
		if (!this.#isInitialized) {
			SiteSettings.initializeSettings();
		}

		// oxlint-disable-next-line typescript/consistent-type-assertions typescript/no-unsafe-type-assertion
		return (SiteSettings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined) as T | undefined;
	}

	static #updateSetting(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number], value: string | undefined) {
		if (!this.#isInitialized) {
			SiteSettings.initializeSettings();
		}

		if (value) {
			document.documentElement.dataset[setting] = value;
			SiteSettings.#searchParams?.set(setting, value);
		} else {
			// oxlint-disable-next-line typescript/no-dynamic-delete
			delete document.documentElement.dataset[setting];
			SiteSettings.#searchParams?.delete(setting);
		}

		const shouldUpdateUrl = SiteSettings.debug || SiteSettings.updateUrl;
		const hasSearchParams = SiteSettings.#searchParams !== undefined && SiteSettings.#searchParams.size > 0;

		if (shouldUpdateUrl && hasSearchParams) {
			const newUrl = new URL(document.location.href);

			newUrl.search = SiteSettings.#searchParams?.toString() ?? '';
			history.replaceState(null, '', newUrl);
		}
	}

	static #persistSetting(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number], value: string | undefined) {
		if (SiteSettings.VOLATILE_SETTINGS.includes(setting)) {
			return;
		}

		if (value) {
			localStorage.setItem(setting, value);
		} else {
			localStorage.removeItem(setting);
		}
	}

	static #checkCssNakedDay() {
		const CSS_NAKED_MONTH = 3;
		const CSS_NAKED_DAY = 9;
		const DAYS_IN_WEEK_COUNT = 6;

		const currentDate = new Date();

		if (currentDate.getMonth() === CSS_NAKED_MONTH) {
			const cssNakedDay = new Date();
			cssNakedDay.setDate(CSS_NAKED_DAY);

			const cssNakedWeekBegin = new Date();
			const cssNakedWeekEnd = new Date();

			// Slides the week window based on the day of the week that CSS naked day happens.
			cssNakedWeekBegin.setDate(cssNakedDay.getDate() - cssNakedDay.getDay());
			cssNakedWeekEnd.setDate(cssNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - cssNakedDay.getDay()));

			if ((currentDate.getDate() >= cssNakedWeekBegin.getDate() && currentDate.getDate() <= cssNakedWeekEnd.getDate())) {
				return true;
			}
		}

		return false;
	}

	static #checkJsNakedDay() {
		const JS_NAKED_MONTH = 3;
		const JS_NAKED_DAY = 24;
		const DAYS_IN_WEEK_COUNT = 6;

		const currentDate = new Date();
		if (currentDate.getMonth() === JS_NAKED_MONTH) {
			const jsNakedDay = new Date();
			jsNakedDay.setDate(JS_NAKED_DAY);

			const jsNakedWeekBegin = new Date();
			const jsNakedWeekEnd = new Date();

			// Slides the week window based on the day of the week that js naked day happens.
			jsNakedWeekBegin.setDate(jsNakedDay.getDate() - jsNakedDay.getDay());
			jsNakedWeekEnd.setDate(jsNakedDay.getDate() + (DAYS_IN_WEEK_COUNT - jsNakedDay.getDay()));

			if (currentDate.getDate() >= jsNakedWeekBegin.getDate() && currentDate.getDate() <= jsNakedWeekEnd.getDate()) {
				return true;
			}
		}

		return false;
	}

	static get apiUrl() {
		return new URL(import.meta.env.DEV ? 'https://localhost:4242/' : '/', document.location.href).href;
	}

	static get updateUrl(): boolean {
		return SiteSettings.#getSetting('updateUrl') === 'true';
	}

	static set updateUrl(value: boolean | undefined) {
		SiteSettings.#updateSetting('updateUrl', value ? 'true' : 'false');
		SiteSettings.#persistSetting('updateUrl', value ? 'true' : 'false');
	}

	static get debug(): boolean {
		return SiteSettings.#getSetting('debug') === 'true';
	}

	static set debug(value: boolean | undefined) {
		SiteSettings.#updateSetting('debug', value ? 'true' : 'false');
		SiteSettings.#persistSetting('debug', value ? 'true' : 'false');
	}

	static get isCssNakedDay() {
		if (!this.#isInitialized) {
			SiteSettings.initializeSettings();
		}

		return this.#isCssNakedDay;
	}

	static get css(): EnabledDisabledSetting {
		const setting = SiteSettings.#getSetting<EnabledDisabledSetting>('css');

		if (setting !== undefined) {
			return setting;
		}

		if (this.#isCssNakedDay) {
			return 'disabled';
		}

		return 'enabled';
	}

	static set css(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('css', value);
		SiteSettings.#persistSetting('css', value);
	}

	static get isJsNakedDay() {
		if (!this.#isInitialized) {
			SiteSettings.initializeSettings();
		}

		return this.#isJsNakedDay;
	}

	static get js(): EnabledDisabledSetting {
		const setting = SiteSettings.#getSetting<EnabledDisabledSetting>('js');

		if (setting !== undefined) {
			return setting;
		}

		if (this.#isJsNakedDay) {
			return 'disabled';
		}

		return 'enabled';
	}

	static set js(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('js', value);
		SiteSettings.#persistSetting('js', value);
	}

	static get iabEscape(): boolean {
		return SiteSettings.#getSetting('iabEscape') === 'true';
	}

	static set iabEscape(value: boolean | undefined) {
		SiteSettings.#updateSetting('iabEscape', value ? 'true' : 'false');
	}

	static get theme(): ThemeSetting {
		return SiteSettings.#getSetting<ThemeSetting>('theme') ?? 'system';
	}

	static set theme(value: ThemeSetting | undefined) {
		SiteSettings.#updateSetting('theme', value);
		SiteSettings.#persistSetting('theme', value);
	}

	static get font(): FontSetting {
		return SiteSettings.#getSetting<FontSetting>('font') ?? 'default';
	}

	static set font(value: FontSetting | undefined) {
		SiteSettings.#updateSetting('font', value);
		SiteSettings.#persistSetting('font', value);
	}

	static get fontSize(): FontSizeSetting {
		return SiteSettings.#getSetting<FontSizeSetting>('fontSize') ?? 'medium';
	}

	static set fontSize(value: FontSizeSetting | undefined) {
		SiteSettings.#updateSetting('fontSize', value);
		SiteSettings.#persistSetting('fontSize', value);
	}

	static get letterSpacing(): LetterSpacingSetting {
		return SiteSettings.#getSetting<LetterSpacingSetting>('letterSpacing') ?? 'medium';
	}

	static set letterSpacing(value: LetterSpacingSetting | undefined) {
		SiteSettings.#updateSetting('letterSpacing', value);
		SiteSettings.#persistSetting('letterSpacing', value);
	}

	static get lineHeight(): LineHeightSetting {
		return SiteSettings.#getSetting<LineHeightSetting>('lineHeight') ?? 'medium';
	}

	static set lineHeight(value: LineHeightSetting | undefined) {
		SiteSettings.#updateSetting('lineHeight', value);
		SiteSettings.#persistSetting('lineHeight', value);
	}

	static get pwaBanner(): boolean {
		return SiteSettings.#getSetting('pwaBanner') === 'true';
	}

	static set pwaBanner(value: boolean | undefined) {
		SiteSettings.#updateSetting('pwaBanner', value ? 'true' : 'false');
		SiteSettings.#persistSetting('pwaBanner', value ? 'true' : 'false');
	}

	static get logoContextMenu(): EnabledDisabledSetting {
		return SiteSettings.#getSetting('logoContextMenu') ?? 'enabled';
	}

	static set logoContextMenu(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('logoContextMenu', value);
		SiteSettings.#persistSetting('logoContextMenu', value);
	}

	static get isReducedMotion(): EnabledDisabledSetting {
		const setting = SiteSettings.#getSetting<EnabledDisabledSetting>('isReducedMotion');

		if (setting !== undefined) {
			return setting;
		}

		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'enabled' : 'disabled';
	}

	static set isReducedMotion(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('isReducedMotion', value);
		SiteSettings.#persistSetting('isReducedMotion', value);
	}

	static get hasSolidBorders(): EnabledDisabledSetting {
		const setting = SiteSettings.#getSetting<EnabledDisabledSetting>('hasSolidBorders');

		if (setting !== undefined) {
			return setting;
		}

		return 'disabled';
	}

	static set hasSolidBorders(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('hasSolidBorders', value);
		SiteSettings.#persistSetting('hasSolidBorders', value);
	}

	static get borderWidth(): BorderWidthSetting {
		const setting = SiteSettings.#getSetting<BorderWidthSetting>('borderWidth');

		if (setting !== undefined) {
			return setting;
		}

		return 'medium';
	}

	static set borderWidth(value: BorderWidthSetting | undefined) {
		SiteSettings.#updateSetting('borderWidth', value);
		SiteSettings.#persistSetting('borderWidth', value);
	}

	static get readingVoice() {
		return SiteSettings.#getSetting('readingVoice');
	}

	static set readingVoice(value) {
		SiteSettings.#updateSetting('readingVoice', value);
		SiteSettings.#persistSetting('readingVoice', value);
	}

	static get readingSpeed(): number {
		return Number.parseFloat(SiteSettings.#getSetting('readingSpeed') ?? '1');
	}

	static set readingSpeed(value: number | undefined) {
		SiteSettings.#updateSetting('readingSpeed', value !== undefined ? value.toString() : undefined);
		SiteSettings.#persistSetting('readingSpeed', value !== undefined ? value.toString() : undefined);
	}

	static get wheelOfFortuneAnimation(): EnabledDisabledSetting {
		const setting = SiteSettings.#getSetting<EnabledDisabledSetting>('wheelOfFortuneAnimation');

		if (setting !== undefined) {
			return setting;
		}

		// INFO: reduced motion and wheel animations are inverted
		return SiteSettings.isReducedMotion === 'enabled' ? 'disabled' : 'enabled';
	}

	static set wheelOfFortuneAnimation(value: EnabledDisabledSetting | undefined) {
		SiteSettings.#updateSetting('wheelOfFortuneAnimation', value);
		SiteSettings.#persistSetting('wheelOfFortuneAnimation', value);
	}

	static get wheelOfFortuneDisplay(): WheelOfFortuneDisplaySetting {
		return SiteSettings.#getSetting<WheelOfFortuneDisplaySetting>('wheelOfFortuneDisplay') ?? 'wheel';
	}

	static set wheelOfFortuneDisplay(value: WheelOfFortuneDisplaySetting | undefined) {
		SiteSettings.#updateSetting('wheelOfFortuneDisplay', value);
		SiteSettings.#persistSetting('wheelOfFortuneDisplay', value);
	}
}

SiteSettings.initializeSettings();
