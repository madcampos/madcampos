import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
// @ts-expect-error
import LogoSvg from '../../components/LogoSvg.astro';

type LogoThemes = 'hacker' | 'system' | 'uwu' | 'y2k';
type LogoSizes = 'full' | 'micro' | 'mini';

async function renderLogo(size: LogoSizes, theme: LogoThemes) {
	const container = await AstroContainer.create();

	return container.renderToString(LogoSvg, {
		props: {
			subtitle: 'Test',
			shortSubtitle: 'Test',
			size,
			theme
		}
	});
}

export const GET: APIRoute = async () => {
	const logos = [
		await renderLogo('full', 'system'),
		await renderLogo('mini', 'system'),
		await renderLogo('micro', 'system'),

		await renderLogo('full', 'uwu'),
		await renderLogo('mini', 'uwu'),
		await renderLogo('micro', 'uwu'),

		await renderLogo('full', 'y2k'),
		await renderLogo('mini', 'y2k'),
		await renderLogo('micro', 'y2k'),

		await renderLogo('full', 'hacker'),
		await renderLogo('mini', 'hacker'),
		await renderLogo('micro', 'hacker')
	];

	// TODO: pack zip file

	return new Response('', {
		status: 200,
		headers: {
			'Content-Type': 'application/zip'
		}
	});
};
