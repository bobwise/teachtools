// Team Generator JavaScript
// Handles team creation, shuffling, and display

class TeamGenerator {
	constructor() {
		this.students = [];
		this.teams = [];
		this.teamNames = {}; // Store custom team names
		this.draggedFrom = null; // Track where member is dragged from
		this.showLeaders = false; // Track if team leaders are enabled
		this.setupEventListeners();
	}

	setupEventListeners() {
		const namesInput = document.getElementById('studentNames');
		const generateBtn = document.getElementById('generateTeamsBtn');
		const shuffleBtn = document.getElementById('shuffleBtn');
		const modeRadios = document.querySelectorAll('input[name="teamMode"]');
		const groupSizeInput = document.getElementById('groupSize');
		const numGroupsInput = document.getElementById('numGroups');
		const leadersCheckbox = document.getElementById('includeLeaders');

		// Toggle leaders checkbox
		if (leadersCheckbox) {
			leadersCheckbox.addEventListener('change', (e) => {
				this.showLeaders = e.target.checked;
				if (this.teams.length > 0) {
					this.displayTeams();
				}
			});
		}

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
			this.showError('Please add at least one team member');
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
		this.teamNames = {}; // Reset team names when generating new teams
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
		this.teamNames = {}; // Reset team names when shuffling
		for (let i = 0; i < shuffled.length; i += groupSize) {
			const team = shuffled.slice(i, i + groupSize);
			this.teams.push(team);
		}

		this.displayTeams();
	}

	attachTeamNameEditors() {
		const teamHeadings = document.querySelectorAll('.team-name');
		teamHeadings.forEach((heading) => {
			heading.addEventListener('click', (e) => {
				if (e.target.tagName === 'INPUT') return; // Don't edit if already editing
				const teamIndex = heading.dataset.teamIndex;
				const currentName = heading.textContent;
				
				// Create input field
				const input = document.createElement('input');
				input.type = 'text';
				input.value = currentName;
				input.className = 'team-name-input';
				
				// Replace heading with input
				heading.replaceWith(input);
				input.focus();
				input.select();
				
				const saveName = () => {
					const newName = input.value.trim() || currentName;
					this.teamNames[teamIndex] = newName;
					
					const newHeading = document.createElement('h4');
					newHeading.className = 'team-name';
					newHeading.dataset.teamIndex = teamIndex;
					newHeading.textContent = newName;
					
					input.replaceWith(newHeading);
					this.attachTeamNameEditors();
				};
				
				const cancelEdit = () => {
					const newHeading = document.createElement('h4');
					newHeading.className = 'team-name';
					newHeading.dataset.teamIndex = teamIndex;
					newHeading.textContent = currentName;
					
					input.replaceWith(newHeading);
					this.attachTeamNameEditors();
				};
				
				input.addEventListener('blur', saveName);
				input.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') saveName();
					if (e.key === 'Escape') cancelEdit();
				});
			});
		});
	}

	attachDragHandlers() {
		const teamMembers = document.querySelectorAll('.team-members li');
		const teams = document.querySelectorAll('[data-team-drop]');

		// Handle member drag start
		teamMembers.forEach((member) => {
			member.addEventListener('dragstart', (e) => {
				const teamIndex = parseInt(member.dataset.team);
				const memberIndex = parseInt(member.dataset.member);
				this.draggedFrom = { teamIndex, memberIndex };
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', member.textContent || '');
				member.classList.add('dragging');
			});

			member.addEventListener('dragend', (e) => {
				member.classList.remove('dragging');
				teams.forEach((team) => team.classList.remove('drag-over'));
			});
		});

		// Handle team drop zones
		teams.forEach((team) => {
			team.addEventListener('dragover', (e) => {
				if (this.draggedFrom) {
					e.preventDefault();
					e.dataTransfer.dropEffect = 'move';
					team.classList.add('drag-over');
				}
			});

			team.addEventListener('dragleave', (e) => {
				if (e.target === team) {
					team.classList.remove('drag-over');
				}
			});

			team.addEventListener('drop', (e) => {
				e.preventDefault();
				team.classList.remove('drag-over');

				if (!this.draggedFrom) return;

				const dropTeamIndex = parseInt(team.dataset.teamDrop);
				const fromTeamIndex = this.draggedFrom.teamIndex;
				const fromMemberIndex = this.draggedFrom.memberIndex;
				const fromTeam = this.teams[fromTeamIndex];
				const toTeam = this.teams[dropTeamIndex];

				if (!fromTeam || !toTeam || fromMemberIndex < 0 || fromMemberIndex >= fromTeam.length) {
					this.draggedFrom = null;
					return;
				}

				const draggedName = fromTeam[fromMemberIndex];
				const targetMemberEl = e.target.closest('li[data-member]');

				if (targetMemberEl) {
					// Drop on a name: swap the two names.
					const targetMemberIndex = parseInt(targetMemberEl.dataset.member);
					if (
						dropTeamIndex === fromTeamIndex &&
						targetMemberIndex === fromMemberIndex
					) {
						this.draggedFrom = null;
						return;
					}

					const targetName = toTeam[targetMemberIndex];
					if (targetName !== undefined) {
						toTeam[targetMemberIndex] = draggedName;
						fromTeam[fromMemberIndex] = targetName;
					}
				} else {
					// Drop on blank team area: move to the end of that team.
					fromTeam.splice(fromMemberIndex, 1);
					toTeam.push(draggedName);
				}

				this.draggedFrom = null;
				this.displayTeams();
			});
		});
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
				const teamName = this.teamNames[index] || `Team ${teamNum}`;
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
					<div class="team" style="background: linear-gradient(135deg, ${bgColor} 0%, rgba(0, 102, 204, 0.05) 100%)" data-team-drop="${index}">
						<h4 class="team-name" data-team-index="${index}">${teamName}</h4>
						<ul class="team-members">
							${team.map((student, memberIndex) => {
							const isLeader = this.showLeaders && memberIndex === 0;
							const leaderClass = isLeader ? 'team-leader' : '';
							return `<li draggable="true" data-team="${index}" data-member="${memberIndex}" class="${leaderClass}"><span class="member-name">${student}</span>${isLeader ? '<span class="leader-badge">👑</span>' : ''}</li>`;
						}).join('')}
						</ul>
					</div>
				`;
			})
			.join('');

		wrapper.style.display = 'block';
		this.clearMessages();
		this.attachTeamNameEditors();
		this.attachDragHandlers();
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
