import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('old-button-graphic-design')
export class GraphicDesignButton extends LitElement {
	static override styles = css`
		button {
			--rainbow-color: lime;
			animation: 3s steps(6) infinite;
		}
		button #button-base { fill: url(#graphic-design-gradient); }
		button text {
			fill: var(--rainbow-color);
			font-family: var(--button-font-papyrus);
		}

		@media not (prefers-reduced-motion) { button { animation-name: rainbow; } }

		@media (prefers-contrast: more), (forced-colors: active) {
			button { animation-name: none; }
			button #button-base { fill: var(--accent-color); }
			button text { fill: var(--dark-bg-color); }
		}
	`;

	protected override render() {
		return html`
			<link rel="stylesheet" href="/components/old-style-buttons/styles.css" />

			<button type="button">
				<svg viewBox="0 0 88 31">
					<radialGradient id="graphic-design-gradient" cx="0" cy="0" r="1" gradientTransform="matrix(84 0 0 13.5 2 15.5)" gradientUnits="userSpaceOnUse">
						<stop offset="0" stop-color="#9370db" />
						<stop offset=".34" stop-color="orchid" />
						<stop offset=".63" stop-color="#9370db" />
						<stop offset="1" stop-color="#ba55d3" />
					</radialGradient>

					<image
						href="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAHJ4c3J9eHGTmF5tb29xs//z3d3z//////////////////////////////////////////////////////////8BGRkZGBoYFxseGB4fHiAZOh0eJiAnVz5DJ0M+V4VTYVNTYVOFdY5zbHOOddOlk5Ol0/PMwczz///////////////AABEIAK8ArAMBIgACEQEDEQH/xABrAAEBAQEBAAAAAAAAAAAAAAAAAwIBBBABAQEBAAIDAQEBAAAAAAAAAAECERIxAxMhQVFhAQADAQEAAAAAAAAAAAAAAAAAAgMBBBEAAgICAgIDAQEAAAAAAAAAAAECESExAxJBURMiYXEy/9oADAMBAAIRAxEAPwD0gAAAAAAAM3UjqHulk6r2xJy61W2b+yt511G2eXJCXlK3KLVtNMRynCS7NNM9CGtWta2xm8olK2ophOVyUE97HOfxbN7EeWW2t/G1LrKk8M2K6TSTbTRUA5UAAAAAAAAAAAAAAAAPPZyra1Ihe1PkapZyR5nGlnPg72uAnbe2QblLcrABXRjoOy2OEvQpSWUKpTVtFJtV5156i3HJyTs6uGbmnZ0GN3kUKt0rNifxt28CdoE7SZ0T+yKALTAANA5fSed1jaTQrkk0n5KuW8jqO/bJPqmwnLrFszbbe1zrrlkrmu3bOG+0rkBKzWTy0fp6aKx4JyzB2VZu5GP2u5wKist2PPg+LPI8+jsl17bArbZBty8YD0pYz/VV4RpHVxQ6x/WENXulreRDNk7Wv0PKnSZX8xlG6tP3VVmM59sdy/grTn+IxnNq7HnHZqX+tXXSY0eqxFo0n9kbs7HnsubyiTa0ZNyStI9HuIerYZ1xrfLywsvvHG0JOuSFraKZvYxvLmNRY2JRyPSnDJ5ui1xKnrFym+L0RfB6MucjPadpejFXHJabRsY7RvQ34/LZ3qmJ1JSash11Q6UInoZupELq/wCk7fUHd+IjfI3/AJga1q6YU8NMWWFantk2uTchO/xrw2zJb6dmtT+tx1zYyrr9ro747d+pTN7GjqMVlIpGEI5SDOuX2lds81odvSsO9ukmxeS/jhZyib2Rls7+HbPVcV+oRi/DCEHtNnJvRd/8ZuNRnpm5odvkRzhx10jlRJza8meOtOF7ifLfk4404ZNDxaKZwrJI5m9jS51JLwGN57GwGkMd8lbmVoCRiVKjkkkdAGmfGf4zvTWryIyXRZXpCTb1HbMklrWpM1TE5CqORIw+zsxidq4HSpFUqVE91Him/bCU3khyS+38QdBB22ccrkwAKQdV6Djo1YGTo7i8q7zLYvY6IO1R28UrVGwFCoAAAAAAABi4lrYAAAAJfImtudiCU1k5+VZv2jQ46gcoAAAAAcU+NNvGotxnTwFgFjpAAAAAAAAAJ7rG6VmN0mzt3GPsrAl8jejm+aUtaN/ZU7QDk3s1zb2JWmQjV6JyjeUaHAhOjo47M6plFvSGjCUtIzQsuRRpos4uODed2LSyvM7LY1TrY0eSsM9IznUrSpcAAAAACe89UAY1ao8ovcSpXNiThWiD42taMV39Bia8mJrygKTUvuO/Xk3VPTH+NPTJOztvFPqjczMhQXk1cSvJnkxErvVb+VNsnQTl1wjhx0JbJqTOddBjpmOmjXqry9jzr5nJDcV07H4O1NM0AqXAAADlvEbdWsZjbSwrKXcTu6neupuUiLlP8ABKZOnYV+OpLYnIpBMrxp7KDnYdULGdzsQj09iO4WStCTjaMuHTqKtHOlKLKSY019cQ9VfGuqppl4yjKsI7MSNudh2HKHQAABnXefgAzrSVtamNVSYkJUn+InU5bwiMzbHLItuVzOP7RTuloxxd0sLyzOcWtfXFQ1IokkTmHeVsaaY4eNbABjxONgA82sXLPOvVZ1Dc8CST2iU4vcdmI7ns1G8Sbjv16YotNMxQaaa16N8p4tihY5HQAH//2Q=="
						id="graphic-design-froggy"
						width="25"
						height="25"
					/>

					<path id="button-base" d="M0 0h88v31H0z" />

					<path id="button-border-down" fill-opacity="0.4" d="M88 31H0l2-2h84l2 2Z" />
					<path id="button-border-right" fill-opacity="0.4" d="M88 0v31l-2-2V2l2-2Z" />
					<path id="button-border-up" fill-opacity="0.4" d="M0 0h88l-2 2H2L0 0Z" />
					<path id="button-border-left" fill-opacity="0.4" d="M0 31V0l2 2v27l-2 2Z" />

					<text>
						<tspan x="32" y="13">Graphic Design</tspan>
						<tspan x="32" dy="1em">is my passion</tspan>
					</text>

					<use xlink:href="#graphic-design-froggy" transform="translate(60 3)" />
				</svg>
			</button>
		`;
	}
}
