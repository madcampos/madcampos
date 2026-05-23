document.addEventListener('DOMContentLoaded', async () => {
	await Promise.allSettled([
		import('../../../components/RadarChart/radar-chart.ts')
	]);
});
