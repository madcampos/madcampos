export type SettingEnabledDisabled = 'disabled' | 'enabled';
export type ThemeSetting = 'dark' | 'hacker' | 'high-contrast' | 'light' | 'low-contrast' | 'system' | 'uwu' | 'y2k';
export type FontSetting = 'browser' | 'comic-sans' | 'default' | 'legibility';
export type FontSizeSetting = 'large' | 'normal' | 'small' | 'x-large' | 'x-small';
export type LineHeightSetting = 'normal' | 'tight' | 'wide' | 'wider';
export type LetterSpacingSetting = 'normal' | 'tight' | 'tighter' | 'wide' | 'wider';

export class SiteSettings {
	static AVAILABLE_SETTINGS = ['debug', 'css', 'js', 'iabEscape', 'theme', 'pwaBanner', 'updateUrl', 'font', 'fontSize', 'lineHeight', 'letterSpacing'] as const;
	static VOLATILE_SETTINGS: typeof SiteSettings.AVAILABLE_SETTINGS[number][] = ['iabEscape', 'pwaBanner', 'updateUrl'] as const;

	static #searchParams?: URLSearchParams;

	static #isCssNakedDay = false;
	static #isJsNakedDay = false;

	static #initializeSettings() {
		if (SiteSettings.#searchParams) {
			return;
		}

		SiteSettings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of SiteSettings.AVAILABLE_SETTINGS) {
			SiteSettings.#updateSetting(setting, SiteSettings[setting]?.toString());
		}

		this.#isCssNakedDay = this.#checkCssNakedDay();
		this.#isJsNakedDay = this.#checkJsNakedDay();
	}

	static #getSetting<T extends string>(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number]) {
		SiteSettings.#initializeSettings();

		return (SiteSettings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined) as T | undefined;
	}

	static #updateSetting(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number], value: string | undefined) {
		SiteSettings.#initializeSettings();

		if (value) {
			document.documentElement.dataset[setting] = value;
			SiteSettings.#searchParams?.set(setting, value);

			if (!SiteSettings.VOLATILE_SETTINGS.includes(setting)) {
				localStorage.setItem(setting, value);
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete document.documentElement.dataset[setting];
			SiteSettings.#searchParams?.delete(setting);
			localStorage.removeItem(setting);
		}

		const shouldUpdateUrl = (SiteSettings.debug ?? false) || (SiteSettings.updateUrl ?? false);
		const hasSearchParams = SiteSettings.#searchParams !== undefined && SiteSettings.#searchParams.size > 0;

		if (shouldUpdateUrl && hasSearchParams) {
			const newUrl = new URL(document.location.href);

			newUrl.search = SiteSettings.#searchParams?.toString() ?? '';
			history.replaceState(null, '', newUrl);
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
	}

	static get debug(): boolean {
		return SiteSettings.#getSetting('debug') === 'true';
	}

	static set debug(value: boolean | undefined) {
		SiteSettings.#updateSetting('debug', value ? 'true' : 'false');
	}

	static get isCssNakedDay() {
		SiteSettings.#initializeSettings();

		return this.#isCssNakedDay;
	}

	static get css() {
		const cssSetting = SiteSettings.#getSetting<SettingEnabledDisabled>('css');

		if (cssSetting !== undefined) {
			return cssSetting;
		}

		if (this.#isCssNakedDay) {
			return 'disabled';
		}

		return 'enabled';
	}

	static set css(value) {
		SiteSettings.#updateSetting('css', value);
	}

	static get isJsNakedDay() {
		SiteSettings.#initializeSettings();

		return this.#isJsNakedDay;
	}

	static get js() {
		const jsSetting = SiteSettings.#getSetting<SettingEnabledDisabled>('js');

		if (jsSetting !== undefined) {
			return jsSetting;
		}

		if (this.#isJsNakedDay) {
			return 'disabled';
		}

		return 'enabled';
	}

	static set js(value) {
		SiteSettings.#updateSetting('js', value);
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
	}

	static get font(): FontSetting {
		return SiteSettings.#getSetting<FontSetting>('font') ?? 'default';
	}

	static set font(value: FontSetting | undefined) {
		SiteSettings.#updateSetting('font', value);
	}

	static get fontSize(): FontSizeSetting {
		return SiteSettings.#getSetting<FontSizeSetting>('fontSize') ?? 'normal';
	}

	static set fontSize(value: FontSizeSetting | undefined) {
		SiteSettings.#updateSetting('fontSize', value);
	}

	static get letterSpacing(): LetterSpacingSetting {
		return SiteSettings.#getSetting<LetterSpacingSetting>('letterSpacing') ?? 'normal';
	}

	static set letterSpacing(value: LetterSpacingSetting | undefined) {
		SiteSettings.#updateSetting('letterSpacing', value);
	}

	static get lineHeight(): LineHeightSetting {
		return SiteSettings.#getSetting<LineHeightSetting>('lineHeight') ?? 'normal';
	}

	static set lineHeight(value: LineHeightSetting | undefined) {
		SiteSettings.#updateSetting('lineHeight', value);
	}

	static get pwaBanner(): boolean {
		return SiteSettings.#getSetting('pwaBanner') === 'true';
	}

	static set pwaBanner(value: boolean | undefined) {
		SiteSettings.#updateSetting('pwaBanner', value ? 'true' : 'false');
	}
}
