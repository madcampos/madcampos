import { html } from '@lit-labs/ssr';

export const iabEscape = html`
	<iab-escape>
		<dialog tabindex="0">
			<h2>It's a trap!</h2>
			<div>
				<p>You are locked inside an In-App Browser.</p>
				<p>
					Those are made to lock you inside a platform and control all your data.
					<br />
					They may promise you privacy, but dont'respect that.
				</p>
				<p>Tap the link below to open this page in your default browser.</p>
			</div>
			<a href="#" target="_blank">Escape this trap</a>
		</dialog>
		<script src="/js/components/iab-escape.mjs" type="module"></script>
	</iab-escape>
`;
