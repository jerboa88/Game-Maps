let tilesize = 512,
		bounds = [[0, 0], [-1024, 1024]],
		map = L.map('map', {
			crs: L.CRS.Simple,
			zoom: 0,
			minZoom: 0,
			maxZoom: 4,
			maxBounds: bounds,
			zoomDelta: 0.5,
			zoomSnap: 0.5,
			wheelPxPerZoomLevel: 128
		});

L.tileLayer('tiles/{z}/{y}-{x}.jpg', {
	minZoom: 0,
	maxZoom: 4,
	tileSize: tilesize,
	zoomOffset: 0,
	attribution: 'Site made by <a href="https://johng.io/">John Goodliff</a>. Map data from Call of Duty: Modern Warfare by <a href="https://www.activision.com/">Activision</a>'
}).addTo(map);

map.zoomControl.setPosition('topright') // Position zoom control
map.fitBounds(bounds);
