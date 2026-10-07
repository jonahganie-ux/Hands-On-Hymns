const colorThemeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const colorStorageKey = 'hands-on-hymns-color-mode';

const applyColorMode = (mode, savePreference = false) => {
	const colorMode = mode === 'red' ? 'red' : 'blue';
	document.documentElement.dataset.colorMode = colorMode;

	if (themeLabel) themeLabel.textContent = colorMode === 'red' ? 'Red' : 'Blue';
	if (colorThemeToggle) {
		const nextMode = colorMode === 'red' ? 'blue' : 'red';
		colorThemeToggle.setAttribute('aria-label', `Switch to ${nextMode} color theme`);
		colorThemeToggle.setAttribute('aria-pressed', String(colorMode === 'red'));
	}
	if (themeColorMeta) themeColorMeta.content = colorMode === 'red' ? '#a43848' : '#193f70';

	if (savePreference) {
		try {
			localStorage.setItem(colorStorageKey, colorMode);
		} catch {
			// Keep the selected theme for this page even when browser storage is unavailable.
		}
	}
};

let savedColorMode = 'blue';
try {
	savedColorMode = localStorage.getItem(colorStorageKey) || 'blue';
} catch {
	// The blue theme is the fallback when browser storage is unavailable.
}
applyColorMode(savedColorMode);

let toastTimeoutId;
const themeToast = document.createElement('div');
themeToast.className = 'theme-toast';
themeToast.setAttribute('role', 'status');
themeToast.setAttribute('aria-live', 'polite');
themeToast.innerHTML = '<span class="theme-toast-mark" aria-hidden="true"></span><span data-toast-message></span>';
document.body.append(themeToast);

const showThemeToast = (mode) => {
	const toastMessage = themeToast.querySelector('[data-toast-message]');
	toastMessage.textContent = `${mode === 'red' ? 'Red' : 'Blue'} theme is now active`;
	themeToast.classList.add('is-visible');
	window.clearTimeout(toastTimeoutId);
	toastTimeoutId = window.setTimeout(() => themeToast.classList.remove('is-visible'), 2400);
};

if (colorThemeToggle) {
	colorThemeToggle.addEventListener('click', () => {
		const nextMode = document.documentElement.dataset.colorMode === 'red' ? 'blue' : 'red';
		applyColorMode(nextMode, true);
		showThemeToast(nextMode);
	});
}

const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNav = document.querySelector('[data-site-nav]');

if (menuToggle && siteNav) {
	menuToggle.addEventListener('click', () => {
		const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
		menuToggle.setAttribute('aria-expanded', String(!isOpen));
		siteNav.classList.toggle('is-open', !isOpen);
	});

	siteNav.addEventListener('click', (event) => {
		if (event.target instanceof HTMLAnchorElement) {
			menuToggle.setAttribute('aria-expanded', 'false');
			siteNav.classList.remove('is-open');
		}
	});

	document.addEventListener('click', (event) => {
		if (event.target instanceof Node && !siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
			menuToggle.setAttribute('aria-expanded', 'false');
			siteNav.classList.remove('is-open');
		}
	});
}

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && menuToggle && siteNav?.classList.contains('is-open')) {
		menuToggle.setAttribute('aria-expanded', 'false');
		siteNav.classList.remove('is-open');
		menuToggle.focus();
	}
});

document.querySelectorAll('[data-current-year]').forEach((element) => {
	element.textContent = String(new Date().getFullYear());
});

const songs = window.HYMN_SONGS || [];
document.querySelectorAll('[data-song-count]').forEach((element) => {
	element.textContent = String(songs.length);
});

const featuredSongs = document.querySelector('[data-home-songs]');
if (featuredSongs) {
	featuredSongs.innerHTML = songs.slice(0, 3).map((song, index) => `
		<a class="featured-card" href="lyrics.html?song=${encodeURIComponent(song.slug || '')}" aria-label="Browse ${song.title} in the songbook">
			<span class="card-index">SONG ${String(index + 1).padStart(2, '0')}</span>
			<h3>${song.title}</h3>
			<span class="card-arrow" aria-hidden="true">↗</span>
		</a>
	`).join('');
}

const songGrid = document.querySelector('[data-song-list]');
if (songGrid) {
	const searchInput = document.querySelector('[data-song-search]');
	const sortSelect = document.querySelector('[data-song-sort]');
	const resultCount = document.querySelector('[data-result-count]');
	const emptyState = document.querySelector('[data-empty-state]');
	const songDialog = document.querySelector('[data-song-dialog]');

	const shortcutHint = document.querySelector('.search-box kbd');
	if (shortcutHint) shortcutHint.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';

	const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

	const renderSongs = () => {
		const query = normalize(searchInput.value);
		const matches = songs
			.map((song, index) => ({ ...song, originalIndex: index }))
			.filter((song) => normalize(song.title).includes(query));

		if (sortSelect.value === 'az') {
			matches.sort((a, b) => a.title.localeCompare(b.title));
		}

		songGrid.innerHTML = matches.map((song) => `
			<button class="song-card" type="button" data-song-index="${song.originalIndex}" aria-label="Open ${song.title} lyrics page">
				<span class="song-card-number">${String(song.originalIndex + 1).padStart(2, '0')}</span>
				<span class="song-card-text">
					<span class="song-card-title">${song.title}</span>
					<span class="song-card-page">Songbook page ${song.page}</span>
				</span>
				<span class="song-card-arrow" aria-hidden="true">↗</span>
			</button>
		`).join('');

		resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'song' : 'songs'}`;
		emptyState.hidden = matches.length !== 0;
	};

	searchInput.addEventListener('input', renderSongs);
	sortSelect.addEventListener('change', renderSongs);

	songGrid.addEventListener('click', (event) => {
		const card = event.target.closest('[data-song-index]');
		if (!card) return;

		const song = songs[Number(card.dataset.songIndex)];
		if (!song) return;

		window.location.href = song.slug ? `lyrics.html?song=${encodeURIComponent(song.slug)}` : 'songs.html';
	});

	if (songDialog) {
		songDialog.addEventListener('click', (event) => {
			if (event.target === songDialog) songDialog.close();
		});
	}

	document.addEventListener('keydown', (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			searchInput.focus();
		}
	});

	renderSongs();
}
