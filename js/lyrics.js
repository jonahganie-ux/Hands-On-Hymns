const songs = window.HYMN_SONGS || [];
const titleElement = document.querySelector('[data-song-title]');
const pageElement = document.querySelector('[data-song-page]');
const breadcrumbElement = document.querySelector('[data-song-breadcrumb]');
const lyricsContainer = document.querySelector('[data-song-lyrics]');

const slug = new URLSearchParams(window.location.search).get('song');
const song = songs.find((entry) => entry.slug === slug) || songs[0];

if (titleElement && song) {
	titleElement.textContent = song.title;
}

if (pageElement && song) {
	pageElement.textContent = String(song.page);
}

if (breadcrumbElement && song) {
	breadcrumbElement.textContent = song.title;
}

if (lyricsContainer) {
	const lines = Array.isArray(song?.lyrics) && song.lyrics.length > 0 ? song.lyrics : [
		'This song is in the ministry collection.',
		'The full lyrics will be added from the printed hymn book soon.'
	];

	lyricsContainer.innerHTML = lines.map((line) => `<p class="lyric-line">${line}</p>`).join('');
}

if (!song) {
	if (titleElement) titleElement.textContent = 'Song not found';
	if (lyricsContainer) {
		lyricsContainer.innerHTML = '<p class="lyric-line">Choose a song from the songbook to open its lyrics page.</p>';
	}
}
