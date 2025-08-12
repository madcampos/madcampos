import { html } from 'lit';

export const webrings = html`
	<details id="webrings">
		<summary>
			<h2 id="webrings-label">
				<m-icon icon="uil:globe"></m-icon>
				<span>Webrings links</span>
			</h2>
		</summary>

		<div id="webrings-list">
			<m-webring
				id="a11y-webring-club"
				prev-link="https://a11y-webring.club/prev"
				next-link="https://a11y-webring.club/next"
				random-link="https://a11y-webring.club/random"
			>
				<span slot="title">a11y-webring.club</span>
				<p>This site is a member of the <a rel="external" href="https://a11y-webring.club/">a11y-webring.club</a>.</p>
			</m-webring>
		</div>
	</details>
`;
