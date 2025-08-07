export class SiteSettings {
	static get #settingsAvailable() {
		return /** @type {const} */ (['debug', 'css', 'js', 'enableIab', 'theme', 'pwa']);
	}

	/** @type {URLSearchParams} */
	static #searchParams;

	static #initializeSettings() {
		if (SiteSettings.#searchParams) {
			return;
		}

		SiteSettings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of SiteSettings.#settingsAvailable) {
			SiteSettings.#updateSetting(setting, SiteSettings[setting]?.toString());
		}
	}

	/**
	 * @param {string} setting
	 */
	static #getSetting(setting) {
		SiteSettings.#initializeSettings();

		return SiteSettings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined;
	}

	/**
	 * @param {string} setting
	 * @param {string | undefined} value
	 */
	static #updateSetting(setting, value) {
		SiteSettings.#initializeSettings();

		if (value) {
			document.documentElement.dataset[setting] = value;
			SiteSettings.#searchParams?.set(setting, value);
			localStorage.setItem(setting, value);
		} else {
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

	static set shouldShareSettings(value) {
		SiteSettings.#updateSetting('shareSettings', value ? 'true' : 'false');
	}

	static get debug() {
		return SiteSettings.#getSetting('debug') === 'true';
	}

	static set debug(value) {
		SiteSettings.#updateSetting('debug', value ? 'true' : 'false');
	}

	static get css() {
		return SiteSettings.#getSetting('css');
	}

	static set css(value) {
		SiteSettings.#updateSetting('css', value);
	}

	static get js() {
		return SiteSettings.#getSetting('js');
	}

	static set js(value) {
		SiteSettings.#updateSetting('js', value);
	}

	static get enableIab() {
		return SiteSettings.#getSetting('enableIab') === 'true';
	}

	static set enableIab(value) {
		SiteSettings.#updateSetting('enableIab', value ? 'true' : 'false');
	}

	static get theme() {
		return SiteSettings.#getSetting('theme');
	}

	static set theme(value) {
		SiteSettings.#updateSetting('theme', value);
	}

	static get pwa() {
		return SiteSettings.#getSetting('pwa');
	}

	static set pwa(value) {
		SiteSettings.#updateSetting('pwa', value);
	}
}
