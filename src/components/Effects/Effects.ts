import { html } from 'lit/static-html.js';

export const svgEffects = html`
	<style>
		@layers components {
			#svg-effects {
				border: 0;
				clip: rect(0, 0, 0, 0);
				position: absolute;
				top: -1px;
				left: -1px;
				opacity: 0;
				z-index: -1;
				margin: 0;
				padding: 0;
				width: 1px;
				height: 1px;
				overflow: hidden;
				pointer-events: none;
				user-select: none;
			}
		}
	</style>
	<div id="svg-effects" aria-hidden="true">
		<svg viewBox="0 0 10 10" width="1" height="1" aria-hidden="true" role="none">
			<defs>
				<filter id="small-pixelate-filter">
					<feGaussianBlur result="blurred-image" stdDeviation="1" />
					<feImage
						href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVAgdY1ywgOEDAwKxgJhIgFQ+AP/vCNK2s+8LAAAAAElFTkSuQmCC"
						width="3"
						height="3"
					/>
					<feTile result="displacement-map" />
					<feDisplacementMap
						in="blurred-image"
						in2="displacement-map"
						result="pixelated-image"
						scale="8"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>
				<filter id="glitch-filter">
					<feTurbulence baseFrequency="0 1.01" numOctaves="32" seed="2" />
					<feMorphology operator="dilate" radius="8" result="glitch-lines" />
					<feDisplacementMap in="SourceGraphic" in2="glitch-lines" scale="32" xChannelSelector="R" yChannelSelector="R" />
					<feOffset dy="-2" />
				</filter>
				<filter id="animated-glitch-filter">
					<feTurbulence baseFrequency="0 2" numOctaves="32">
						<animate attributeName="numOctaves" dur="16s" repeatCount="indefinite" values="8;2;16;2;8;32;8;2;8;16;32;4;2;8;16;64" />
						<animate attributeName="baseFrequency" dur="30s" repeatCount="indefinite" values="0 0.001; 0 0.002" />
						<animate
							additive="sum"
							attributeName="baseFrequency"
							calcMode="discrete"
							dur="60s"
							repeatCount="indefinite"
							values="0 0.001;0 2;0 3;0 0.001;0 0.001;0.001 5;0 2;0 3;0 2;0 0.001;0.5 2;1 0.05;0 0.001;0 0.001;0 4;0 0.001;0.001 3;0 0.1;0 0.001;0 2;0 6;0 2;0 0.001;0.001 1;0 0.001;0 0.001;0 2;0 0.001;"
						/>
						<animate attributeName="seed" calcMode="discrete" dur="120s" repeatCount="indefinite" values="1;2;3;4;5" />
					</feTurbulence>
					<feMorphology operator="dilate" radius="8" result="glitch-lines" />
					<feDisplacementMap in="SourceGraphic" in2="glitch-lines" scale="32" xChannelSelector="R" yChannelSelector="R" />
				</filter>
				<filter id="pixelate-filter">
					<feGaussianBlur result="blurred-image" stdDeviation="8" />
					<feImage
						href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVAgdY1ywgOEDAwKxgJhIgFQ+AP/vCNK2s+8LAAAAAElFTkSuQmCC"
						width="15"
						height="15"
					/>
					<feTile result="displacement-map" />
					<feDisplacementMap
						in="blurred-image"
						in2="displacement-map"
						result="pixelated-image"
						scale="50"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
					<feOffset dx="-12" dy="-12" />
				</filter>
				<filter id="noise-filter">
					<feGaussianBlur result="blurred-image" stdDeviation="16" />
					<feTurbulence baseFrequency="1.2" numOctaves="10" stitchTiles="stitch" type="fractalNoise" />
					<feColorMatrix type="saturate" values="0" />
					<feComposite in2="blurred-image" operator="in" />
					<feComponentTransfer>
						<feFuncA slope=".7" type="linear" />
					</feComponentTransfer>
				</filter>
			</defs>
		</svg>
	</div>
`;
