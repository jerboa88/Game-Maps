let minzoom = -1,
		maxzoom = 4,
		tilesize = 512,
		bounds = [[0, 0], [-1024, 1024]],
		map = L.map('map', {
			crs: L.CRS.Simple,
			zoom: minzoom,
			minZoom: minzoom,
			maxZoom: maxzoom,
			maxNativeZoom: maxzoom,
			maxBounds: bounds,
			zoomDelta: 0.5,
			zoomSnap: 0.5,
			wheelPxPerZoomLevel: 128
		});

L.tileLayer('tiles/{z}/{y}-{x}.jpg', {
	minZoom: minzoom,
	maxZoom: maxzoom + 1,
	maxNativeZoom: maxzoom + 1,
	tileSize: tilesize,
	zoomOffset: 1,
	attribution: 'Site made by <a href="https://johng.io/">John Goodliff</a> | Map data from Call of Duty: Modern Warfare by <a href="https://www.activision.com/">Activision</a> | Map powered by <a href="https://leafletjs.com/">Leaflet</a>'
}).addTo(map);

L.imageOverlay('tiles/0/0-0.jpg', bounds, {pane: 'mapPane'}).addTo(map);

// L.control.scale().addTo(map);

map.attributionControl.setPrefix('')

map.zoomControl.setPosition('topright')	// Position zoom control

map.fitBounds(bounds);
