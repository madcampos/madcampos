import { default as Docxtemplater } from 'docxtemplater';
import fs from 'node:fs/promises';
import { default as PizZip } from 'pizzip';
import resume from '../public/assets/resume.json' with { type: 'json' };

const SOURCE_FILE = './template.docx';
const DEST_FOLDER = '../public/assets/';
const DEST_FILE = `${DEST_FOLDER}resume.docx`;

const template = await fs.readFile(new URL(SOURCE_FILE, import.meta.url), 'binary');
const unzippedTemplate = new PizZip(template);
const doc = new Docxtemplater(unzippedTemplate, {
	paragraphLoop: true,
	linebreaks: true
});

const formatter = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' });
const collator = new Intl.Collator('en', { usage: 'sort' });

function dateSorter(
	{ startDate: startA, endDate: endA }: { startDate: string, endDate?: string },
	{ startDate: startB, endDate: endB }: { startDate: string, endDate?: string }
) {
	if (!endA && !endB) {
		return 0;
	} else if (!endA) {
		return -1;
	} else if (!endB) {
		return 1;
	}

	const endDateA = new Date(endA);
	const endDateB = new Date(endB);
	const startDateA = new Date(startA);
	const startDateB = new Date(startB);

	return endDateB.getTime() - endDateA.getTime() || startDateB.getTime() - startDateA.getTime();
}

const CUTOUT_YEAR = 5;
const cutoutDate = new Date();

cutoutDate.setFullYear(cutoutDate.getFullYear() - CUTOUT_YEAR);

doc.render({
	name: resume.basics.name,
	label: resume.basics.label,
	summary: resume.basics.summary,
	links: [
		resume.basics.email,
		resume.basics.url,
		...resume.basics.profiles.map(({ url }) => url)
	],
	skills: [
		...resume.skills.toSorted(({ name: nameA }, { name: nameB }) => collator.compare(nameA, nameB)),
		...resume.languages
			.toSorted(({ language: langA }, { language: langB }) => collator.compare(langA, langB))
			.map(({ language, fluency }) => ({ name: language, level: fluency }))
	],
	work: resume.work
		.toSorted(dateSorter)
		.filter(({ endDate }) => {
			if (!endDate) {
				return true;
			}

			const dateTime = new Date(endDate);
			if (cutoutDate.getFullYear() < dateTime.getFullYear()) {
				return true;
			}

			return false;
		}).map((item) => ({
			...item,
			startDate: formatter.format(new Date(item.startDate)),
			endDate: item.endDate ? formatter.format(new Date(item.endDate)) : 'Present'
		})),
	volunteer: resume.volunteer
		.toSorted(dateSorter)
		.filter(({ endDate }, index) => {
			if (!endDate || index === 0) {
				return true;
			}

			const dateTime = new Date(endDate);
			if (cutoutDate.getFullYear() < dateTime.getFullYear()) {
				return true;
			}

			return false;
		}).map((item) => ({
			...item,
			startDate: formatter.format(new Date(item.startDate)),
			endDate: item.endDate ? formatter.format(new Date(item.endDate)) : 'Present'
		})),
	education: resume.education
		.toSorted(dateSorter)
		.map((item) => ({
			...item,
			startDate: formatter.format(new Date(item.startDate)),
			endDate: item.endDate ? formatter.format(new Date(item.endDate)) : 'Present'
		})),
	interests: resume.interests.map(({ name }) => name)
});

const folderPath = new URL(DEST_FOLDER, import.meta.url);
try {
	await fs.access(folderPath);
} catch {
	await fs.mkdir(folderPath, { recursive: true });
}

await fs.writeFile(new URL(DEST_FILE, import.meta.url), doc.toBuffer());
