import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage({ type: 'window', windowBounds: { width: 1270, height: 1310 } });
await page.goto('https://localhost:3000/resume/', {
	waitUntil: 'networkidle2'
});

await page.pdf({
	path: './public/assets/documents/resume.pdf',
	displayHeaderFooter: false,
	format: 'letter',
	preferCSSPageSize: true,
	printBackground: true,
	scale: 1
});

await browser.close();
