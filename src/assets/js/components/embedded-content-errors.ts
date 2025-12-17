document.querySelectorAll('img, audio, video, iframe').forEach((embed) => {
	embed.addEventListener('error', () => {
		embed.toggleAttribute('data-load-error', true);
	});
});
