import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('css-naked-day')
export class CssNakedDay extends LitElement {
	static override styles = css`@layer components { #css-banner { display: none; } }`;

	protected override render() {
		return html`
			<div id="css-banner">
				<hr />
				<h2>Why this website looks so weird?</h2>
				<p>We are celebrating CSS Naked Day!</p>
				<p>Find out more on <a href="/blog/2025/04/css-naked-day-2025">this blog post</a>.</p>
				<hr />
			</div>
			<script src="/js/css-naked-day.js" type="module"></script>
		`;
	}
}
