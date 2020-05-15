(function () {
	// Configuration
	let minzoom = 0,
			maxzoom = 4,
			zoomSteps = 0.5,
			tilesize = 512,

			// From https://www.reddit.com/r/ModernWarzone/comments/f5k7l8/mathmatically_correct_size_of_wz_map/
			// Thanks SlammedOptima!
			realmapsize = 2912, // Real world map size in meters
			subCategoryNames = {
				atv: 'ATV',
				tacticalrover: 'Tactical Rover',
				suv: 'SUV',
				cargotruck: 'Cargo Truck',
				helicopter: 'Helicopter'
			}



	// Global variables
	let mapscalefactor = (tilesize * 2) / realmapsize,	// Multiplying the real world distance by this value gives 1024, the width of the map with 2 tiles
			bounds = [[0, 0], [-realmapsize, realmapsize]]
			map = L.map('map', {
				crs: getCustomProjection(),	// Use our custom projection
				zoom: minzoom,
				minZoom: minzoom,
				minNativeZoom: minzoom,
				maxZoom: maxzoom,
				maxNativeZoom: maxzoom,
				maxBounds: bounds,
				zoomDelta: zoomSteps,
				zoomSnap: zoomSteps,
				wheelPxPerZoomLevel: 128,
				attributionControl: false
			}),
			layers = {};



	// Add event listeners for checkboxes
	function addEventListeners() {
		let group_checkboxes = document.querySelectorAll('.heading > input[type=checkbox]'),
				checkboxes = document.querySelectorAll('li > label > input[type=checkbox]');

		for (const group_checkbox of group_checkboxes) {
			group_checkbox.addEventListener('change', function() {
				toggleLayerGroup(group_checkbox.name, this.checked);
			});
		}

		for (const checkbox of checkboxes) {
			checkbox.addEventListener('change', function() {
				if (this.checked) {
					showLayer(checkbox.name);
				} else {
					hideLayer(checkbox.name);
				}
			});
		}

		// From https://gis.stackexchange.com/questions/88273/triggering-click-event-on-leaflet-map
		// Thanks Alex Leith!
		map.on('click', function(e) {
			let coords = toCoords(e.latlng),
					popup = L.popup()
						.setLatLng(e.latlng)
						.setContent('<p>' + coords[0] + ', ' + coords[1] + '</p>')
						.openOn(map);
		});
	}



	// Generate a custom projection that is basically a simple grid scaled to the real life size of the Warzone map
	function getCustomProjection() {
		// From https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
		// Thanks Senshi!
		return L.extend({}, L.CRS.Simple, {
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
	}



	// Convert a LatLng object to coords
	function toCoords(latLng) {
		return [Math.round(latLng.lng), Math.round(-latLng.lat)];
	}



	// Convert coords to a LatLng object
	function toLatLng(coords) {
		return L.latLng(-coords[1], coords[0]);
	}



	// Iterate through all points and put them on the map
	function createMarkers() {
		fetch('points.json')
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				throw new Error(response.status);
			})
			.then(json => {
				let points = json.points,
						markerSize = 64,
						markerCenter = markerSize / 2,
						popupCenter = -markerSize - 4

				for (category in points) {
					for (subcategory in points[category]) {
						layers[subcategory] = map.createPane(subcategory);

						let icon = L.icon({
								iconUrl: 'img/' + subcategory + '.png',
								iconSize:     [markerSize, markerSize],
								iconAnchor:   [markerCenter, markerSize],
								shadowSize:   [0, 0],
								popupAnchor:  [0, popupCenter]
						});

						for (point of points[category][subcategory]) {
							new L.marker(toLatLng(point), {
								pane: subcategory,
								icon: icon
							}).addTo(map).bindPopup(subCategoryNames[subcategory]);
						}
					}
				}
			});
	}


	// Show a given layer on the map given its name
	function toggleLayerGroup(layerGroupName, isChecked) {
		if (isChecked) {
			for (const key in points[layerGroupName]) {
				if (object.hasOwnProperty(key)) {
					const element = object[key];
					console.log(element);
				}
			}
		}
	}


	var toggleLayerGroup = (function(layerGroupName, isChecked) {
		let mapping = {
			vehicles: ['atv', 'tacticalrover', 'suv', 'cargotruck', 'helicopter']
		};

		return function (layerGroupName, isChecked) {
			if (isChecked) {
				for (const layer of mapping[layerGroupName]) {
					showLayer(layer);
				}
				// Update checkboxes here
			}
			else {
				for (const layer of mapping[layerGroupName]) {
					hideLayer(layer);
				}
				// Update checkboxes here
			}
		}
	})();


	// Show a given layer on the map given its name
	function showLayer(layerName) {
		layers[layerName].style.display = '';
	}


	// Hide a given layer on the map given its name
	function hideLayer(layerName) {
		layers[layerName].style.display = 'none';
	}



	// Load tile layers and configure map controls
	function setupMap() {
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
	}



	setupMap();
	addEventListeners();
	createMarkers();
})();
