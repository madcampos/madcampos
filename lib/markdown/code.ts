import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
	transformerRenderWhitespace
} from '@shikijs/transformers';

import markedShiki from 'marked-shiki';
import {
	type BundledLanguage,
	type BundledTheme,
	type HighlighterGeneric,
	type ThemeRegistration,
	createHighlighter,
	createJavaScriptRegexEngine
} from 'shiki';
import type { ShikiOptions } from '../CollectionsProcessing.ts';

const jsRegexEngine = createJavaScriptRegexEngine();
let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;

export async function init({ langs, themes }: ShikiOptions) {
	highlighter ??= await createHighlighter({
		langs: langs ?? [],
		themes: Object.values(themes ?? {}),
		engine: jsRegexEngine
	});

	return markedShiki({
		highlight: (code, lang, props) =>
			highlighter.codeToHtml(code, {
				lang,
				themes: Object.fromEntries(
					Object.entries(themes ?? {})
						.map(([themeName, theme]) => [themeName, ((theme as ThemeRegistration)?.name ?? theme) as string])
				),
				defaultColor: false,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				meta: { __raw: props.join(' ') },
				transformers: [
					transformerNotationDiff(),
					transformerNotationHighlight(),
					transformerNotationWordHighlight(),
					transformerNotationFocus(),
					transformerNotationErrorLevel(),
					transformerRenderWhitespace({ position: 'boundary' }),
					transformerMetaHighlight(),
					transformerMetaWordHighlight()
				]
			})
	});
}
