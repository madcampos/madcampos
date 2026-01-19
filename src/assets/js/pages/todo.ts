document.addEventListener('DOMContentLoaded', () => {
	if (!document.body.classList.contains('js-enabled')) {
		return;
	}

	document.addEventListener('change', (evt) => {
		const target = evt.target as HTMLInputElement;

		if (target.matches('input[type="checkbox"]')) {
			if (target.hasAttribute('checked')) {
				evt.preventDefault();
				evt.stopPropagation();

				target.checked = true;

				return;
			}

			localStorage.setItem(target.id, target.checked.toString());

			const childrenInputs = [...target.closest('label')?.nextElementSibling?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []];

			childrenInputs.forEach((childInput) => {
				if (!childInput.ariaDisabled) {
					childInput.checked = target.checked;
				}
			});

			const checkedChildrenInputs = childrenInputs.filter(({ checked }) => checked).length;

			if (checkedChildrenInputs > 0 && checkedChildrenInputs < childrenInputs.length) {
				target.indeterminate = true;
			} else {
				target.indeterminate = false;
			}

			const parentInput = document.querySelector<HTMLInputElement>(`label:has( + ul #${target.id}) input`);

			if (parentInput) {
				const siblingInputs = [...target.closest('ul')?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []];
				const checkedInputs = siblingInputs.filter(({ checked }) => checked).length;

				parentInput.checked = checkedInputs === siblingInputs.length;

				if (checkedInputs > 0 && checkedInputs < siblingInputs.length) {
					parentInput.indeterminate = true;
				} else {
					parentInput.indeterminate = false;
				}

				localStorage.setItem(parentInput.id, parentInput.checked ? 'true' : 'false');
			}
		}
	});

	document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
		const isCurrentlyChecked = localStorage.getItem(input.id) === 'true';
		let newChecked = false;

		if (input.checked || isCurrentlyChecked) {
			newChecked = true;
		}

		if (input.hasAttribute('checked')) {
			input.ariaDisabled = 'true';
		}

		input.checked = newChecked;
		localStorage.setItem(input.id, newChecked.toString());
	});

	document.querySelectorAll('label:has( + ul)').forEach((label) => {
		const input = label.querySelector('input[type="checkbox"]') as HTMLInputElement;
		const childInputs = [...label.nextElementSibling?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []];
		const checkedInputs = childInputs.filter(({ checked }) => checked).length;

		if (checkedInputs === childInputs.length) {
			input.checked = true;
		}

		if (checkedInputs > 0 && checkedInputs < childInputs.length) {
			input.indeterminate = true;
		}
	});
});
