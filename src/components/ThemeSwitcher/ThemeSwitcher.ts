import { html } from '@lit-labs/ssr';

interface SiteTheme {
	id: string;
	name: string;
	description: string;
	accessible?: boolean;
	dual?: boolean;
}

const themes: SiteTheme[] = [
	{
		id: 'system',
		name: 'System Default',
		description: 'The default theme for the operating system, either light or dark.',
		accessible: true,
		dual: true
	},
	{
		id: 'light',
		name: 'Light',
		description: 'The default light theme.',
		accessible: true
	},
	{
		id: 'dark',
		name: 'Dark',
		description: 'The default dark theme.',
		accessible: true
	},
	{
		id: 'high-contrast',
		name: 'High Contrast',
		description: 'A high contrast dark and yellow theme.',
		accessible: true
	},
	{
		id: 'uwu',
		name: 'UwU',
		description: 'A cute anime inspired theme.'
	},
	{
		id: 'y2k',
		name: 'Y2K',
		description: "A theme inspired on the 90's internet."
	},
	{
		id: 'hacker',
		name: 'Hacker',
		description: 'A theme inspired by old CRT monitors.'
	},
	// {
	// 	id: 'cork-board',
	// 	name: 'Cork Board',
	// 	description: 'A theme inspired in a skeumorphic corkboard.'
	// },
	// {
	// 	id: 'mecha',
	// 	name: 'Mecha',
	// 	description: 'A post apocaliptic mecha theme.'
	// },
	{
		id: 'debug',
		name: 'DEBUG',
		description: 'Not a real theme, just some debugging styles.',
		accessible: true
	}
];

const themeMap = themes.map(
	({ description, id, name, accessible, dual }) =>
		html`
			<custom-theme
				id="${id}"
				?is-accessible="${accessible}"
				?dual-theme="${dual}"
			>
				<label
					for="${`theme-input-${id}`}"
					id="${`theme-label-${id}`}"
					class="theme-label"
				>
					<input
						type="radio"
						name="theme"
						value="${id}"
						id="${`theme-input-${id}`}"
						required
					/>

					<svg
						viewBox="0 0 100 70"
						class="theme-preview"
						data-theme="${dual ? 'light' : id}"
						role="presentation"
						width="100"
						height="70"
						display="none"
					>
						<g>
							<rect class="theme-preview-bg" x="0" y="0" width="100" height="70" />

							<text class="theme-preview-text theme-preview-header-text" x="5" y="30" role="presentation">Aa</text>
							<text class="theme-preview-text theme-preview-text-text" x="5" y="60" role="presentation">Aa</text>

							<rect class="theme-preview-border theme-preview-dark-bg" x="60" y="20" width="25" height="35" />
							<circle class="theme-preview-border theme-preview-theme-color" cx="60" cy="20" r="10" />
							<circle class="theme-preview-border theme-preview-accent-color" cx="60" cy="55" r="10" />
							<circle class="theme-preview-border theme-preview-complementary-color" cx="85" cy="20" r="10" />
							<circle class="theme-preview-border theme-preview-secondary-color" cx="85" cy="55" r="10" />
						</g>

						<g class="dual-theme" hidden>
							<clipPath id="theme-preview-system-mask">
								<polygon points="0,70 100,0 100,70" />
							</clipPath>
							<g data-theme="dark" clip-path="url(#theme-preview-system-mask)">
								<rect class="theme-preview-bg" x="0" y="0" width="100" height="70" />

								<text class="theme-preview-text theme-preview-header-text" x="5" y="30" role="presentation">Aa</text>
								<text class="theme-preview-text theme-preview-text-text" x="5" y="60" role="presentation">Aa</text>

								<rect class="theme-preview-border theme-preview-dark-bg" x="60" y="20" width="25" height="35" />
								<circle class="theme-preview-border theme-preview-theme-color" cx="60" cy="20" r="10" />
								<circle class="theme-preview-border theme-preview-accent-color" cx="60" cy="55" r="10" />
								<circle class="theme-preview-border theme-preview-complementary-color" cx="85" cy="20" r="10" />
								<circle class="theme-preview-border theme-preview-secondary-color" cx="85" cy="55" r="10" />
							</g>
						</g>
					</svg>

					<strong>${name}</strong>
					<small><em>${description}</em></small>
					<small class="accessible-theme" hidden>
						<m-icon icon="uil:exclamation-triangle"></m-icon>
						<strong>Warning: Theme is not fully accessible</strong>
					</small>
				</label>
			</custom-theme>
		`
);

export const themeSwitcher = html`
	<theme-switcher>
		<aside id="theme-switcher" hidden>
			<button type="button" popovertarget="theme-switcher-dialog" aria-label="Theme Switcher">
				<m-icon icon="uil:palette"></m-icon>
			</button>

			<dialog id="theme-switcher-dialog" popover>
				<form action="./" method="get">
					<header>
						<h2>Choose a theme</h2>
					</header>
					<div id="theme-list">
						${themeMap}
					</div>

					<footer>
						<button type="submit" popovertarget="theme-switcher-dialog" popovertargetaction="hide">Apply theme</button>
					</footer>
				</form>
			</dialog>
		</aside>

		<script src="/js/components/theme-switcher.mjs" type="module"></script>
	</theme-switcher>
`;
