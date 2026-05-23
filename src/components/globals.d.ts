import type { BaselineInfo } from './Baseline/baseline.ts';
import type { CodepenEmbed } from './Codepen/codepen.ts';
import type { HitCounter } from './Counter/counter.ts';
import type { IabEscape } from './IabEscape/iab-escape.ts';
import type { ImageLightbox } from './ImageLightbox/image-lightbox.ts';
import type { InlineShare } from './InlineShare/inline-share.ts';
import type { OldStyleButton } from './OldStyleButtons/old-style-buttons.ts';
import type { PWABanner } from './PwaBanner/pwa-banner.ts';
import type { RadarChart } from './RadarChart/radar-chart.ts';
import type { ReadArticle } from './ReadArticle/read-article.ts';
import type { ShareOptions } from './ShareOptions/share-options.ts';
import type { SiteDisplaySettings } from './SiteSettings/site-settings.ts';
import type { WheelOffortune } from './WheelOfFortune/wheel-of-fortune.ts';
import type { YoutubeEmbed } from './Youtube/youtube.ts';

declare global {
	interface HTMLElementTagNameMap {
		// #region HTML only elements
		'author-card': HTMLElement;
		'code-wrapper': HTMLElement;
		'css-naked-day': HTMLElement;
		'decorated-line': HTMLElement;
		'dialog-content': HTMLElement;
		'draft-tag': HTMLElement;
		'm-avatar': HTMLElement;
		'm-logo': HTMLElement;
		'm-note': HTMLElement;
		'm-webrings': HTMLElement;
		'related-posts': HTMLElement;
		'rendered-content': HTMLElement;
		'scroll-to-top': HTMLElement;
		'site-nav': HTMLElement;
		'skip-to-content': HTMLElement;
		'sr-only': HTMLElement;
		'svg-defs': HTMLElement;
		'table-wrapper': HTMLElement;
		'text-swatch': HTMLElement;
		// #endregion

		// #region Baseline component
		'baseline-info': BaselineInfo;
		'baseline-browser-icon': HTMLElement;
		'baseline-heading': HTMLElement;
		'baseline-icon': HTMLElement;
		// #endregion

		// #region Card component
		'm-card': HTMLElement;
		'card-links': HTMLElement;
		'card-subtitle': HTMLElement;
		'card-title': HTMLElement;
		// #endregion

		// #region Input
		'input-wrapper': HTMLElement;
		'input-error': HTMLElement;
		'input-hint': HTMLElement;
		'input-infix': HTMLElement;
		'input-required': HTMLElement;
		'input-success': HTMLElement;
		// #endregion

		// #region Color Swatch
		'color-swatch': HTMLElement;
		'color-swatch-group': HTMLElement;
		// #endregion

		// #region Image Lightbox
		'img-lightbox': ImageLightbox;
		'img-lightbox-controls': HTMLElement;
		// #endregion

		// #region Inline Share
		'inline-share': InlineShare;
		'share-overlay': HTMLElement;
		// #endregion

		// #region Old Style Buttons
		'old-style-button': OldStyleButton;
		'old-style-buttons': HTMLElement;
		// #endregion

		// #region Pagination
		'm-pagination': HTMLElement;
		'pagination-details': HTMLElement;
		// #endregion

		// #region Post Header
		'post-header': HTMLElement;
		'post-metadata': HTMLElement;
		// #endregion

		// #region Prompt Injection
		'pro-em-pt-br': HTMLElement;
		'ob-fus-ate': HTMLElement;
		'super-important': HTMLElement;
		// #endregion

		// #region Site settings
		'site-settings': SiteDisplaySettings;
		'font-list': HTMLElement;
		'theme-list': HTMLElement;
		// #endregion

		// #region Tag List
		'tag-list': HTMLElement;
		'tag-item': HTMLElement;
		// #endregion

		// #region wheel of Fortune
		'wheel-of-fortune': WheelOffortune;
		'list-container': HTMLElement;
		'wheel-container': HTMLElement;
		'wheel-display-options': HTMLElement;
		// #endregion

		// #region Other components
		'codepen-embed': CodepenEmbed;
		'hit-counter': HitCounter;
		'iab-escape': IabEscape;
		'pwa-banner': PWABanner;
		'radar-chart': RadarChart;
		'read-article': ReadArticle;
		'share-options': ShareOptions;
		'youtube-embed': YoutubeEmbed;
		// #endregion
	}
}
