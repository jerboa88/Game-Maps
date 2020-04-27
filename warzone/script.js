let minzoom = 0,
		maxzoom = 4,
		tilesize = 512,

		// From https://www.reddit.com/r/ModernWarzone/comments/f5k7l8/mathmatically_correct_size_of_wz_map/
		// Thanks SlammedOptima!
		realmapsize = 2912, // Real world map size in meters
		mapscalefactor = (tilesize * 2) / realmapsize,	// Multiplying the real world distance by this value gives 1024, the width of the map with 2 tiles
		bounds = [[0, 0], [-realmapsize, realmapsize]];

let points = {
	vehicles: {
		atv: 	[
			[943, 2454],
			[625, 2256],
			[711, 2101]
		],
		tacticalrover: 	[
			[1117, 2377]
		]
	}
}

let checkboxes = document.querySelectorAll('input[type=checkbox]')

for (const checkbox of checkboxes) {
	checkbox.addEventListener('change', function() {
		if (this.checked) {
			showLayer(checkbox.name);
		} else {
			hideLayer(checkbox.name);
		}
	});
}



// From https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
// Thanks Senshi!
L.CRS.pr = L.extend({}, L.CRS.Simple, {
  projection: L.Projection.LonLat,
  transformation: new L.Transformation(mapscalefactor, 0, -mapscalefactor, 0),

	// Scale, zoom and distance are from CRS.Simple
  scale: function(zoom) {
    return 2**zoom;
  },

  zoom: function(scale) {
    return Math.log(scale) / Math.LN2;
  },

  distance: function(latlng1, latlng2) {
    let dx = latlng2.lng - latlng1.lng,
      	dy = latlng2.lat - latlng1.lat;

    return Math.sqrt(dx * dx + dy * dy);
  },
  infinite: true
});



// Convert a LatLng object to coords
function toCoords(latLng) {
	return [Math.round(latLng.lng), Math.round(-latLng.lat)];
}


// Convert coords to a LatLng object
function toLatLng(coords) {
	return L.latLng(-coords[1], coords[0]);
}


let map = L.map('map', {
	crs: L.CRS.pr,	// Use our custom projection
	zoom: minzoom,
	minZoom: minzoom,
	minNativeZoom: minzoom,
	maxZoom: maxzoom,
	maxNativeZoom: maxzoom,
	maxBounds: bounds,
	zoomDelta: 0.5,
	zoomSnap: 0.5,
	wheelPxPerZoomLevel: 128,
	attributionControl: false
});



let layers = {}


// Iterate through all points and put them on the map
function initMarkers() {
	for (category in points) {
		for (subcategory in points[category]) {
			layers[subcategory] = map.createPane(subcategory);

			for (point of points[category][subcategory]) {
				new L.marker(toLatLng(point), {
					pane: subcategory
				}).addTo(map).bindPopup(subcategory);
			}
		}
	}
}


function showLayer(layerName) {
	layers[layerName].style.display = '';
}


function hideLayer(layerName) {
	layers[layerName].style.display = 'none';
}




// https://gis.stackexchange.com/questions/88273/triggering-click-event-on-leaflet-map
// Thanks Alex Leith!
map.on('click', function(e) {
	let coords = toCoords(e.latlng);
	let popup = L.popup()
	.setLatLng(e.latlng)
	.setContent('<p>' + coords[0] + ', ' + coords[1] + '</p>')
	.openOn(map);
});

L.tileLayer('tiles/{z}/{y}-{x}.jpg', {
	minZoom: minzoom,
	minNativeZoom: minzoom,
	maxZoom: maxzoom + 1,
	maxNativeZoom: maxzoom + 1,
	tileSize: tilesize,
	zoomOffset: 1
}).addTo(map);

// Low res background image
L.imageOverlay('tiles/0/0-0.jpg', bounds, {pane: 'mapPane'}).addTo(map);

L.control.scale().addTo(map);

map.zoomControl.setPosition('topright')	// Position zoom control

map.fitBounds(bounds);

initMarkers();
