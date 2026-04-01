// Team Generator JavaScript
// Handles team creation, shuffling, and display

class TeamGenerator {
	constructor() {
		this.students = [];
		this.teams = [];
		this.setupEventListeners();
	}

	setupEventListeners() {
		const namesInput = document.getElementById('studentNames');
		const generateBtn = document.getElementById('generateTeamsBtn');
		const shuffleBtn = document.getElementById('shuffleBtn');
		const modeRadios = document.querySelectorAll('input[name="teamMode"]');
		const groupSizeInput = document.getElementById('groupSize');
		const numGroupsInput = document.getElementById('numGroups');

		// Update inputs based on selected mode
		modeRadios.forEach((radio) => {
			radio.addEventListener('change', (e) => {
				const mode = e.target.value;
				if (mode === 'size') {
					groupSizeInput.disabled = false;
					numGroupsInput.disabled = true;
				} else {
					groupSizeInput.disabled = true;
					numGroupsInput.disabled = false;
				}
			});
		});

		// Generate teams on input change
		namesInput.addEventListener('input', () => {
			this.parseStudents();
		});

		generateBtn.addEventListener('click', () => {
			this.generateTeams();
		});

		shuffleBtn.addEventListener('click', () => {
			this.shuffleTeams();
		});

		// Initialize
		const sizeRadio = document.querySelector(
			'input[name="teamMode"][value="size"]'
		);
		if (sizeRadio && sizeRadio.checked) {
			numGroupsInput.disabled = true;
		} else {
			groupSizeInput.disabled = true;
		}
	}

	parseStudents() {
		const input = document.getElementById('studentNames').value;
		// Split by both commas and newlines, filter empty entries
		this.students = input
			.split(/[,\n]/)
			.map((name) => name.trim())
			.filter((name) => name.length > 0);

		this.updateStudentCount();
	}

	updateStudentCount() {
		const countElement = document.getElementById('studentCount');
		if (countElement) {
			countElement.textContent = `${this.students.length} students`;
		}
	}

	generateTeams() {
		if (this.students.length === 0) {
			this.showError('Please add at least one student');
			return;
		}

		const mode = document.querySelector('input[name="teamMode"]:checked').value;
		let groupSize = parseInt(document.getElementById('groupSize').value);
		let numGroups = parseInt(document.getElementById('numGroups').value);

		// Validate inputs
		if (mode === 'size') {
			if (groupSize < 1) {
				this.showError('Group size must be at least 1');
				return;
			}
		} else {
			if (numGroups < 1) {
				this.showError('Number of groups must be at least 1');
				return;
			}
		}

		// Shuffle students
		const shuffled = this.shuffleArray([...this.students]);

		// Create teams
		this.teams = [];
		if (mode === 'size') {
			// Divide by group size
			for (let i = 0; i < shuffled.length; i += groupSize) {
				const team = shuffled.slice(i, i + groupSize);
				this.teams.push(team);
			}
		} else {
			// Divide into number of groups
			groupSize = Math.ceil(shuffled.length / numGroups);
			for (let i = 0; i < numGroups; i++) {
				const start = i * groupSize;
				const end = Math.min(start + groupSize, shuffled.length);
				const team = shuffled.slice(start, end);
				if (team.length > 0) {
					this.teams.push(team);
				}
			}
		}

		this.displayTeams();
	}

	shuffleTeams() {
		if (this.teams.length === 0) {
			this.showError('Generate teams first');
			return;
		}

		// Flatten teams, shuffle, and regenerate
		const shuffled = this.shuffleArray([...this.students]);
		const groupSize = Math.ceil(shuffled.length / this.teams.length);

		this.teams = [];
		for (let i = 0; i < shuffled.length; i += groupSize) {
			const team = shuffled.slice(i, i + groupSize);
			this.teams.push(team);
		}

		this.displayTeams();
	}

	shuffleArray(array) {
		// Fisher-Yates shuffle
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	displayTeams() {
		const container = document.getElementById('teamsContainer');
		const wrapper = document.getElementById('teamsWrapper');

		if (!container) return;

		if (this.teams.length === 0) {
			container.innerHTML = '<div class="empty-state">No teams generated yet</div>';
			return;
		}

		container.innerHTML = this.teams
			.map((team, index) => {
				const teamNum = index + 1;
				const colors = [
					'#e3f2fd',
					'#f3e5f5',
					'#e8f5e9',
					'#fff3e0',
					'#fce4ec',
					'#e0f2f1',
				];
				const bgColor = colors[index % colors.length];

				return `
					<div class="team" style="background: linear-gradient(135deg, ${bgColor} 0%, rgba(0, 102, 204, 0.05) 100%)">
						<h4>Team ${teamNum}</h4>
						<ul class="team-members">
							${team.map((student) => `<li>${student}</li>`).join('')}
						</ul>
					</div>
				`;
			})
			.join('');

		wrapper.style.display = 'block';
		this.clearMessages();
	}

	showError(message) {
		const container = document.getElementById('teamsContainer');
		const wrapper = document.getElementById('teamsWrapper');

		if (container) {
			container.innerHTML = `<div class="error-message">${message}</div>`;
		}
		wrapper.style.display = 'block';
	}

	clearMessages() {
		const error = document.querySelector('.error-message');
		const success = document.querySelector('.success-message');
		if (error) error.remove();
		if (success) success.remove();
	}
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	new TeamGenerator();
});
