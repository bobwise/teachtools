document.addEventListener('DOMContentLoaded', () => {
    const namesInput = document.getElementById('names');
    const pickNextButton = document.getElementById('generateTeamsBtn');
    const pickerResult = document.getElementById('pickerResult');
    const noRepeatsCheckbox = document.getElementById('includeLeaders');

    let remainingNames = [];
    let lastNamesSignature = '';
    let lastSelectedName = '';

    if (!namesInput || !pickNextButton || !pickerResult) {
        return;
    }

    const parseNames = () => {
        return (namesInput.value || '')
            .split(/[\n,;]/)
            .map((name) => name.trim())
            .filter((name) => name.length > 0);
    };

    const createSignature = (names) => names.join('|');

    const resetNoRepeatPoolIfNeeded = (names) => {
        const currentSignature = createSignature(names);
        if (currentSignature !== lastNamesSignature) {
            remainingNames = [];
            lastNamesSignature = currentSignature;
			if (!names.includes(lastSelectedName)) {
				lastSelectedName = '';
			}
        }
    };

    const pickRandomName = (names, excludedName) => {
        if (names.length === 0) {
            return '';
        }

        if (names.length === 1) {
            return names[0];
        }

        const availableNames = excludedName
            ? names.filter((name) => name !== excludedName)
            : names;
        const pool = availableNames.length > 0 ? availableNames : names;
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    };

    pickNextButton.addEventListener('click', () => {
        const names = parseNames();

        if (names.length === 0) {
            pickerResult.classList.remove('hidden');
            pickerResult.textContent = 'Add at least one name to pick a student.';
            return;
        }

        let selectedName = '';

        if (noRepeatsCheckbox && noRepeatsCheckbox.checked) {
            resetNoRepeatPoolIfNeeded(names);

            if (remainingNames.length === 0) {
                remainingNames = [...names];
            }

            selectedName = pickRandomName(remainingNames, lastSelectedName);
            const selectedIndex = remainingNames.indexOf(selectedName);
            if (selectedIndex !== -1) {
                remainingNames.splice(selectedIndex, 1);
            }
        } else {
            selectedName = pickRandomName(names, lastSelectedName);
        }

        lastSelectedName = selectedName;
        pickerResult.classList.remove('hidden');
        pickerResult.textContent = selectedName;
    });
});
