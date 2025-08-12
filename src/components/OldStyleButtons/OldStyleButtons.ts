import { html } from 'lit';

export const oldStyleButtons = html`
	<details id="old-buttons">
		<summary>
			<h2 id="old-buttons-label">
				<m-icon icon="uil:monitor"></m-icon>
				<span>Old style internet buttons</span>
			</h2>
		</summary>
		<div>
			<old-button-ie dest="https://en.wikipedia.org/wiki/Browser_wars"></old-button-ie>
			<old-button-cc dest="https://creativecommons.org/licenses/by-nc-sa/4.0/"></old-button-cc>
			<old-button-astro dest="https://astro.build/"></old-button-astro>
			<old-button-feed dest="/blog/feed.xml"></old-button-feed>
			<old-button-css dest="https://developer.mozilla.org/en-US/docs/Web/CSS"></old-button-css>
			<old-button-js dest="https://developer.mozilla.org/en-US/docs/Web/JavaScript"></old-button-js>
			<old-button-html dest="https://developer.mozilla.org/en-US/docs/Web/HTML"></old-button-html>
			<old-button-aria dest="https://www.w3.org/WAI/standards-guidelines/wcag/"></old-button-aria>
			<old-button-powered dest="https://workers.cloudflare.com/"></old-button-powered>
			<old-button-writter dest="https://obsidian.md/"></old-button-writter>
			<old-button-pride dest="https://www.the519.org/support-the-519/donate/"></old-button-pride>
			<old-button-code dest="https://code.visualstudio.com/"></old-button-code>
			<old-button-graphic-design></old-button-graphic-design>
			<old-button-guestbook></old-button-guestbook>
		</div>
		<script src="/components/old-style-buttons/script.mjs" type="module"></script>
	</details>
`;
