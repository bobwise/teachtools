// Team Generator JavaScript
// Handles team creation, shuffling, and display

class TeamGenerator {
	constructor() {
		this.students = [];
		this.leaderNames = [];
		this.teams = [];
		this.teamNames = {}; // Store custom team names
		this.draggedFrom = null; // Track where member is dragged from
		this.showLeaders = false; // Track if team leaders are enabled
		this.useSeparateLeaderList = false;
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
		const separateLeaderControls = document.getElementById('separateLeaderControls');
		const useSeparateLeaderListCheckbox = document.getElementById('useSeparateLeaderList');
		const leaderNamesContainer = document.getElementById('leaderNamesContainer');
		const leaderNamesInput = document.getElementById('leaderNames');

		// Toggle leaders checkbox
		if (leadersCheckbox) {
			leadersCheckbox.addEventListener('change', (e) => {
				this.showLeaders = e.target.checked;
				if (separateLeaderControls) {
					separateLeaderControls.style.display = this.showLeaders ? 'block' : 'none';
				}
				if (useSeparateLeaderListCheckbox) {
					useSeparateLeaderListCheckbox.disabled = !this.showLeaders;
					if (!this.showLeaders) {
						useSeparateLeaderListCheckbox.checked = false;
					}
				}
				if (leaderNamesContainer) {
					leaderNamesContainer.style.display =
						this.showLeaders && this.useSeparateLeaderList ? 'block' : 'none';
				}
				if (!this.showLeaders) {
					this.useSeparateLeaderList = false;
				}
				if (this.teams.length > 0) {
					this.displayTeams();
				}
			});
		}

		if (useSeparateLeaderListCheckbox) {
			useSeparateLeaderListCheckbox.addEventListener('change', (e) => {
				this.useSeparateLeaderList = e.target.checked && this.showLeaders;
				if (leaderNamesContainer) {
					leaderNamesContainer.style.display = this.useSeparateLeaderList ? 'block' : 'none';
				}
				if (this.teams.length > 0) {
					this.displayTeams();
				}
			});
		}

		if (leaderNamesInput) {
			leaderNamesInput.addEventListener('input', () => {
				this.parseLeaderNames();
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

		if (separateLeaderControls) {
			separateLeaderControls.style.display = 'none';
		}
		if (leaderNamesContainer) {
			leaderNamesContainer.style.display = 'none';
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

	parseLeaderNames() {
		const input = document.getElementById('leaderNames')?.value || '';
		this.leaderNames = input
			.split(/[,\n]/)
			.map((name) => name.trim())
			.filter((name) => name.length > 0);

		const countElement = document.getElementById('leaderCount');
		if (countElement) {
			countElement.textContent = `${this.leaderNames.length} leaders`;
		}
	}

	updateStudentCount() {
		const countElement = document.getElementById('studentCount');
		if (countElement) {
			countElement.textContent = `${this.students.length} team members`;
		}
	}

	generateTeams() {
		this.parseStudents();
		this.parseLeaderNames();

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

		if (this.useSeparateLeaderList && this.leaderNames.length === 0) {
			this.useSeparateLeaderList = false;
			const useSeparateLeaderListCheckbox = document.getElementById('useSeparateLeaderList');
			const leaderNamesContainer = document.getElementById('leaderNamesContainer');
			if (useSeparateLeaderListCheckbox) {
				useSeparateLeaderListCheckbox.checked = false;
			}
			if (leaderNamesContainer) {
				leaderNamesContainer.style.display = 'none';
			}
		}

		const leaderSet = new Set(this.leaderNames);
		const nonLeaders = this.students.filter((name) => !leaderSet.has(name));
		const leadersToDistribute = this.useSeparateLeaderList
			? this.leaderNames
			: this.showLeaders
				? this.students
				: [];

		const shuffledLeaders = this.shuffleArray([...leadersToDistribute]);
		const shuffledNonLeaders = this.shuffleArray([...nonLeaders]);
		const shuffledAll = this.shuffleArray([...this.students]);

		// Create teams
		this.teams = [];
		this.teamNames = {}; // Reset team names when generating new teams

		if (this.useSeparateLeaderList) {
			const teamCount = mode === 'count'
				? numGroups
				: Math.max(1, Math.ceil(this.students.length / groupSize));

			const teamBuckets = Array.from({ length: teamCount }, () => []);

			// Evenly distribute leaders first; this naturally allows multiple leaders on some teams.
			shuffledLeaders.forEach((leader, index) => {
				teamBuckets[index % teamCount].push(leader);
			});

			// Then distribute non-leaders.
			shuffledNonLeaders.forEach((member, index) => {
				teamBuckets[index % teamCount].push(member);
			});

			this.teams = teamBuckets.filter((team) => team.length > 0);
		} else if (mode === 'size') {
			for (let i = 0; i < shuffledAll.length; i += groupSize) {
				const team = shuffledAll.slice(i, i + groupSize);
				this.teams.push(team);
			}
		} else {
			groupSize = Math.ceil(shuffledAll.length / numGroups);
			for (let i = 0; i < numGroups; i++) {
				const start = i * groupSize;
				const end = Math.min(start + groupSize, shuffledAll.length);
				const team = shuffledAll.slice(start, end);
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
				const draggedIsLeader = this.isLeaderName(draggedName);

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
					const targetIsLeader = this.isLeaderName(targetName);

					if (
						this.useSeparateLeaderList &&
						draggedIsLeader !== targetIsLeader
					) {
						this.draggedFrom = null;
						return;
					}

					if (targetName !== undefined) {
						toTeam[targetMemberIndex] = draggedName;
						fromTeam[fromMemberIndex] = targetName;
					}
				} else {
					// Drop on blank team area: move member to target team.
					fromTeam.splice(fromMemberIndex, 1);

					if (this.useSeparateLeaderList && draggedIsLeader) {
						// Leaders stay grouped at the top of a team.
						const firstNonLeaderIndex = toTeam.findIndex(
							(name) => !this.isLeaderName(name)
						);
						const insertIndex =
							firstNonLeaderIndex === -1 ? toTeam.length : firstNonLeaderIndex;
						toTeam.splice(insertIndex, 0, draggedName);
					} else {
						toTeam.push(draggedName);
					}
				}

				this.draggedFrom = null;
				this.displayTeams();
			});
		});
	}

	isLeaderName(name) {
		if (!this.showLeaders || !name) {
			return false;
		}
		if (this.useSeparateLeaderList) {
			return this.leaderNames.includes(name);
		}
		return false;
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
		const tip = document.getElementById('teamsTip');

		if (!container) return;

		if (this.teams.length === 0) {
			container.innerHTML = '<div class="empty-state">No teams generated yet</div>';
			if (tip) {
				tip.style.display = 'none';
			}
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
							const isLeader = this.useSeparateLeaderList
								? this.isLeaderName(student)
								: this.showLeaders && memberIndex === 0;
							const leaderClass = isLeader ? 'team-leader' : '';
							return `<li draggable="true" data-team="${index}" data-member="${memberIndex}" class="${leaderClass}"><span class="member-name">${student}</span>${isLeader ? '<span class="leader-badge">👑</span>' : ''}</li>`;
						}).join('')}
						</ul>
					</div>
				`;
			})
			.join('');

		wrapper.style.display = 'block';
		if (tip) {
			tip.style.display = 'block';
		}
		this.clearMessages();
		this.attachTeamNameEditors();
		this.attachDragHandlers();
	}

	showError(message) {
		const container = document.getElementById('teamsContainer');
		const wrapper = document.getElementById('teamsWrapper');
		const tip = document.getElementById('teamsTip');

		if (container) {
			container.innerHTML = `<div class="error-message">${message}</div>`;
		}
		if (tip) {
			tip.style.display = 'none';
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
