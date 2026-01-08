document.querySelectorAll<HTMLTableCellElement>('table thead th[aria-sort]').forEach((thCell) => {
	const span = document.createElement('span');
	const id = Math.trunc(Math.random() * 1000000).toString(16);

	span.innerHTML = `
		<label for="sort-button-${id}" id="sort-button-${id}-label"></label>
		<button type="button" id="sort-button-${id}">
			<sr-only>Sort table by</sr-only>
			<sr-only aria-labelledby="sort-button-${id}-label"></sr-only>
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" data-icon><use href="#table-sort-icon-none" width="24" height="24" /></svg>
		</button>
	`;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
	// @ts-ignore
	span.querySelector('label')?.append(...thCell.childNodes);
	thCell.appendChild(span);
});

function sortTable(button: HTMLButtonElement) {
	const tableBody = button.closest<HTMLTableSectionElement>('table')?.querySelector('tbody');
	const tableHeader = button.closest<HTMLTableSectionElement>('table thead');
	const thCell = button.closest<HTMLTableCellElement>('th');

	if (!thCell) {
		return;
	}

	const column = thCell.cellIndex;
	const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true, caseFirst: 'upper' });

	let order = 'none';

	if (button.querySelector('use[href="#table-sort-icon-descending"]')) {
		order = 'ascending';
	} else {
		order = 'descending';
	}

	tableHeader?.querySelectorAll('th').forEach((header) => {
		header.querySelector('use')?.setAttribute('href', '#table-sort-icon-none');
		thCell.ariaSort = 'none';
	});

	button.querySelector('use')?.setAttribute('href', `#table-sort-icon-${order}`);
	thCell.ariaSort = order;

	[...tableBody?.querySelectorAll('tr') ?? []].sort((rowA, rowB) => {
		const columnA = rowA.children[column]?.textContent ?? '';
		const columnB = rowB.children[column]?.textContent ?? '';

		if (order === 'ascending') {
			return collator.compare(columnA, columnB);
		}

		return collator.compare(columnB, columnA);
	}).forEach((row) => tableBody?.appendChild(row));
}

document.body.addEventListener('click', (evt) => {
	const target = evt.target as HTMLButtonElement;

	if (!target.matches('table thead button')) {
		return;
	}

	sortTable(target);
});
