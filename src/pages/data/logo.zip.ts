import { BlobWriter, ZipWriter } from '@zip.js/zip.js';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

import LogoSvg from '../../components/LogoSvg.astro';

type LogoThemes = 'hacker' | 'system' | 'uwu' | 'y2k';
type LogoSizes = 'full' | 'micro' | 'mini';

interface LogoItemStyle {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
	styles?: string;
}

interface LogoStyle {
	part?: LogoItemStyle;
	text?: LogoItemStyle & {
		font?: string,
		fontWeight?: string
	};
	extras?: LogoItemStyle;
}

const sytles: Record<LogoThemes, LogoStyle> = {
	system: {
		part: { fill: '#0080ff' },
		text: { fill: '#ff8000' }
	},
	uwu: {
		part: { fill: '#1e90ff', stroke: '#ffb6c1', strokeWidth: '5rem' },
		text: { fill: '#1e90ff', font: "'Segoe Print', 'Bradley Hand', Chilanka, TSCu_Comic, casual, cursive", fontWeight: '700' },
		extras: { fill: '#1e90ff', stroke: '#9932cc', strokeWidth: '1rem' }
	},
	y2k: {
		part: { fill: 'url(#sunset)', stroke: 'cyan', strokeWidth: '2rem' },
		text: {
			fill: 'cyan',
			stroke: 'hotpink',
			strokeWidth: '0.5rem',
			font: "'Comic Sans MS', 'Segoe Print', 'Bradley Hand', Chilanka, TSCu_Comic, casual, cursive",
			fontWeight: '700'
		},
		extras: { fill: 'deeppink', styles: 'fill-opacity: 0.5; transform: translate(2.5rem, 2.5rem);' }
	},
	hacker: {
		part: { fill: 'lime' },
		text: { fill: 'seagreen', font: "'Chicago', 'Cascadia Code', 'Fira Code', 'Roboto Mono', 'Monaco', 'Courier New', 'Courier', monospace", fontWeight: '700' }
	}
};

async function renderLogoToFile(size: LogoSizes, theme: LogoThemes, styles: LogoStyle, filename: string) {
	const container = await AstroContainer.create();
	const logoString = await container.renderToString(LogoSvg, {
		props: {
			subtitle: 'Test',
			shortSubtitle: 'Test',
			size,
			theme,
			styles
		}
	});

	return new File([logoString], filename, { type: 'image/svg+xml', lastModified: new Date().getTime() });
}

async function createZipFile(files: File[]) {
	const zipBlobWriter = new BlobWriter();
	const zipWriter = new ZipWriter(zipBlobWriter, {
		compressionMethod: 8,
		level: 9,
		useWebWorkers: false
	});

	for (const file of files) {
		await zipWriter.add(file.name, file.stream());
	}

	await zipWriter.close();

	return zipBlobWriter.getData();
}

export const GET: APIRoute = async () => {
	const logos = [
		await renderLogoToFile('full', 'system', sytles.system, 'logo-full.svg'),
		await renderLogoToFile('mini', 'system', sytles.system, 'logo-mini.svg'),
		await renderLogoToFile('micro', 'system', sytles.system, 'logo-micro.svg'),

		await renderLogoToFile('full', 'uwu', sytles.uwu, 'logo-uwu-full.svg'),
		await renderLogoToFile('mini', 'uwu', sytles.uwu, 'logo-uwu-mini.svg'),
		await renderLogoToFile('micro', 'uwu', sytles.uwu, 'logo-uwu-micro.svg'),

		await renderLogoToFile('full', 'y2k', sytles.y2k, 'logo-y2k-full.svg'),
		await renderLogoToFile('mini', 'y2k', sytles.y2k, 'logo-y2k-mini.svg'),
		await renderLogoToFile('micro', 'y2k', sytles.y2k, 'logo-y2k-micro.svg'),

		await renderLogoToFile('full', 'hacker', sytles.hacker, 'logo-hacker-full.svg'),
		await renderLogoToFile('mini', 'hacker', sytles.hacker, 'logo-hacker-mini.svg'),
		await renderLogoToFile('micro', 'hacker', sytles.hacker, 'logo-hacker-micro.svg')
	];

	const zipFile = await createZipFile(logos);

	return new Response(zipFile, {
		status: 200,
		headers: {
			'Content-Type': 'application/zip'
		}
	});
};
