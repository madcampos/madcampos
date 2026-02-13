import { SiteSettings } from '../settings.ts';

type InputSavedState = 'false' | 'indeterminate' | 'true';

function getInputState(input: HTMLInputElement) {
	return (localStorage.getItem(input.id) ?? 'false') as InputSavedState;
}

function getChildrenInputs(input: HTMLInputElement) {
	const childrenInputs = [...(input.labels ?? [])]
		.map(({ nextElementSibling }) => [...(nextElementSibling?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [])])
		.flat();

	return childrenInputs;
}

function setChildInputState(input: HTMLInputElement) {
	getChildrenInputs(input).forEach((childInput) => {
		if (childInput.disabled || childInput.ariaDisabled === 'true') {
			return;
		}

		if (childInput.hasAttribute('checked')) {
			return;
		}

		if (!input.checked) {
			return;
		}

		childInput.checked = true;
	});
}

function setInputState(input: HTMLInputElement) {
	if (input.hasAttribute('checked')) {
		return;
	}

	if (input.disabled || input.ariaDisabled === 'true') {
		return;
	}

	const childrenInputs = getChildrenInputs(input);

	if (childrenInputs.length === 0) {
		return;
	}

	const checkedChildrenInputs = childrenInputs.filter(({ checked }) => checked).length;

	input.checked = childrenInputs.length === checkedChildrenInputs;

	if (checkedChildrenInputs > 0 && checkedChildrenInputs < childrenInputs.length) {
		input.indeterminate = true;
	} else {
		input.indeterminate = false;
	}

	localStorage.setItem(input.id, (input.indeterminate ? 'indeterminate' : input.checked.toString()) as InputSavedState);
}

function setParentInputState(input: HTMLInputElement) {
	const parentInput = document.querySelector<HTMLInputElement>(`li:has(ul #${input.id}) label`);

	if (parentInput) {
		setInputState(parentInput);
	}
}

function updateInput(input: HTMLInputElement) {
	if (input.hasAttribute('checked')) {
		return;
	}

	if (input.disabled || input.ariaDisabled === 'true') {
		return;
	}

	setChildInputState(input);
	setInputState(input);
	setParentInputState(input);
}

if (SiteSettings.js === 'enabled') {
	document.addEventListener('change', (evt) => {
		const target = evt.target as HTMLInputElement;

		if (!target.matches('input[type="checkbox"]')) {
			return;
		}

		if (target.hasAttribute('checked')) {
			evt.preventDefault();
			evt.stopPropagation();

			return;
		}

		if (target.disabled || target.ariaDisabled === 'true') {
			evt.preventDefault();
			evt.stopPropagation();

			return;
		}

		updateInput(target);
	});

	// FIXME: first load is not working
	document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
		const inputState = getInputState(input);

		switch (inputState) {
			case 'false':
				input.checked = false;
				break;
			case 'indeterminate':
				input.indeterminate = true;
				break;
			case 'true':
				input.checked = true;
				break;
			default:
		}

		setChildInputState(input);
		setInputState(input);
	});
}
