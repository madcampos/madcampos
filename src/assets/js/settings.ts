type SettingEnabledDisabled = 'disabled' | 'enabled';

export class SiteSettings {
	static AVAILABLE_SETTINGS = ['debug', 'css', 'js', 'iabEscape', 'theme', 'pwa', 'updateUrl'] as const;
	static VOLATILE_SETTINGS: typeof SiteSettings.AVAILABLE_SETTINGS[number][] = ['iabEscape'] as const;

	static #searchParams?: URLSearchParams;

	static #initializeSettings() {
		if (SiteSettings.#searchParams) {
			return;
		}

		SiteSettings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of SiteSettings.AVAILABLE_SETTINGS) {
			SiteSettings.#updateSetting(setting, SiteSettings[setting]?.toString());
		}
	}

	static #getSetting(setting: typeof SiteSettings.AVAILABLE_SETTINGS[number]) {
		SiteSettings.#initializeSettings();

		return SiteSettings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined;
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

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const shouldUpdateUrl = SiteSettings.debug || SiteSettings.updateUrl;
		const hasSearchParams = SiteSettings.#searchParams !== undefined && SiteSettings.#searchParams.size > 0;

		if (shouldUpdateUrl && hasSearchParams) {
			const newUrl = new URL(document.location.href);

			newUrl.search = SiteSettings.#searchParams?.toString() ?? '';
			history.replaceState(null, '', newUrl);
		}
	}

	static get updateUrl() {
		const setting = SiteSettings.#getSetting('updateUrl');

		if (setting === undefined) {
			return undefined;
		}

		return setting === 'true';
	}

	static set updateUrl(value) {
		SiteSettings.#updateSetting('updateUrl', value ? 'true' : 'false');
	}

	static get debug() {
		const setting = SiteSettings.#getSetting('debug');

		if (setting === undefined) {
			return undefined;
		}

		return setting === 'true';
	}

	static set debug(value) {
		SiteSettings.#updateSetting('debug', value ? 'true' : 'false');
	}

	static get css() {
		return SiteSettings.#getSetting('css') as SettingEnabledDisabled | undefined;
	}

	static set css(value) {
		SiteSettings.#updateSetting('css', value);
	}

	// eslint-disable-next-line id-length
	static get js() {
		return SiteSettings.#getSetting('js') as SettingEnabledDisabled | undefined;
	}

	// eslint-disable-next-line id-length
	static set js(value) {
		SiteSettings.#updateSetting('js', value);
	}

	static get iabEscape() {
		const setting = SiteSettings.#getSetting('iabEscape');

		if (setting === undefined) {
			return undefined;
		}

		return setting === 'true';
	}

	static set iabEscape(value) {
		SiteSettings.#updateSetting('iabEscape', value ? 'true' : 'false');
	}

	static get theme() {
		return SiteSettings.#getSetting('theme');
	}

	static set theme(value) {
		SiteSettings.#updateSetting('theme', value);
	}

	static get pwa() {
		const setting = SiteSettings.#getSetting('pwa');

		if (setting === undefined) {
			return undefined;
		}

		return setting === 'true';
	}

	static set pwa(value) {
		SiteSettings.#updateSetting('pwa', value ? 'true' : 'false');
	}
}
