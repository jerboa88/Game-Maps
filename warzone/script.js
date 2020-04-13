let minzoom = 0,
		maxzoom = 4,
		tilesize = 512,

		// From https://www.reddit.com/r/ModernWarzone/comments/f5k7l8/mathmatically_correct_size_of_wz_map/
		// Thanks SlammedOptima!
		realmapsize = 2912, // Real world map size in meters
		mapscalefactor = (tilesize * 2) / realmapsize,	// Multiplying the real world distance by this value gives 1024, the width of the map with 2 tiles
		bounds = [[0, 0], [-realmapsize, realmapsize]]



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



// From https://leafletjs.com/examples/crs-simple/crs-simple.html
// Thanks Leaflet!
let yx = L.latLng;

let xy = function(x, y) {
	if (L.Util.isArray(x)) {	// When doing xy([x, y]);
		return yx(-x[1], x[0]);
	}
	return yx(-y, x);	// When doing xy(x, y);
};



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
			wheelPxPerZoomLevel: 128
		});



// let mapmarker = xy(realmapsize, realmapsize);	// Test map marker

// L.marker(mapmarker).addTo(map).bindPopup('mapmarker');


L.tileLayer('tiles/{z}/{y}-{x}.jpg', {
	minZoom: minzoom,
	minNativeZoom: minzoom,
	maxZoom: maxzoom + 1,
	maxNativeZoom: maxzoom + 1,
	tileSize: tilesize,
	zoomOffset: 1,
	attribution: 'Site made by <a href="https://johng.io/">John Goodliff</a> | Map data from Call of Duty: Modern Warfare by <a href="https://www.activision.com/">Activision</a> | Map powered by <a href="https://leafletjs.com/">Leaflet</a>'
}).addTo(map);

// Low res background image
L.imageOverlay('tiles/0/0-0.jpg', bounds, {pane: 'mapPane'}).addTo(map);

L.control.scale().addTo(map);

map.attributionControl.setPrefix('')

map.zoomControl.setPosition('topright')	// Position zoom control

map.fitBounds(bounds);
