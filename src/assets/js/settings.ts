export class SiteSettings {
	static get #settingsAvailable() {
		return ['debug', 'css', 'js', 'enableIab', 'theme', 'pwa'] as const;
	}

	static #searchParams?: URLSearchParams;

	static #initializeSettings() {
		if (SiteSettings.#searchParams) {
			return;
		}

		SiteSettings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of SiteSettings.#settingsAvailable) {
			SiteSettings.#updateSetting(setting, SiteSettings[setting]?.toString());
		}
	}

	static #getSetting(setting: string) {
		SiteSettings.#initializeSettings();

		return SiteSettings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined;
	}

	static #updateSetting(setting: string, value: string | undefined) {
		SiteSettings.#initializeSettings();

		if (value) {
			document.documentElement.dataset[setting] = value;
			SiteSettings.#searchParams?.set(setting, value);
			localStorage.setItem(setting, value);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete document.documentElement.dataset[setting];
			SiteSettings.#searchParams?.delete(setting);
			localStorage.removeItem(setting);
		}

		const shouldUpdateUrl = SiteSettings.debug || SiteSettings.shouldShareSettings;
		const hasSearchParams = SiteSettings.#searchParams !== undefined && SiteSettings.#searchParams.size > 0;

		if (shouldUpdateUrl && hasSearchParams) {
			const newUrl = new URL(document.location.href);

			newUrl.search = SiteSettings.#searchParams?.toString() ?? '';
			history.replaceState(null, '', newUrl);
		}
	}

	static get shouldShareSettings() {
		return SiteSettings.#getSetting('shareSettings') === 'true';
	}

	static set shouldShareSettings(value: boolean) {
		SiteSettings.#updateSetting('shareSettings', value ? 'true' : 'false');
	}

	static get debug() {
		return SiteSettings.#getSetting('debug') === 'true';
	}

	static set debug(value: boolean) {
		SiteSettings.#updateSetting('debug', value ? 'true' : 'false');
	}

	static get css() {
		return SiteSettings.#getSetting('css');
	}

	static set css(value: string | undefined) {
		SiteSettings.#updateSetting('css', value);
	}

	// eslint-disable-next-line id-length
	static get js() {
		return SiteSettings.#getSetting('js');
	}

	// eslint-disable-next-line id-length
	static set js(value: string | undefined) {
		SiteSettings.#updateSetting('js', value);
	}

	static get enableIab() {
		return SiteSettings.#getSetting('enableIab') === 'true';
	}

	static set enableIab(value: boolean | undefined) {
		SiteSettings.#updateSetting('enableIab', value ? 'true' : 'false');
	}

	static get theme() {
		return SiteSettings.#getSetting('theme');
	}

	static set theme(value: string | undefined) {
		SiteSettings.#updateSetting('theme', value);
	}

	static get pwa() {
		return SiteSettings.#getSetting('pwa');
	}

	static set pwa(value: string | undefined) {
		SiteSettings.#updateSetting('pwa', value);
	}
}
