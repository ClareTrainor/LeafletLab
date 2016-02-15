// //this is my tutorials document 

// /* Example from Leaflet Quick Start Guide*/

// //we are initializing the map and setting its geographic coordinates and zoom level
// var map = L.map('map').setView([51.505, -0.09], 13);

// //This creates a tile layer from a URL template 
// L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
//     attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//     maxZoom: 20,
// }).addTo(map);

// //this adds a marker at this latitude and longitude to the map
// var marker = L.marker([51.5, -0.09]).addTo(map);

// //this adds a circle to the map at a latitude and longitude with a specific color, opacity, and size
// var circle = L.circle([51.508, -0.11], 500, {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5
// }).addTo(map);

// //this adds a polygon to the map 
// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(map);

// //this binds a popup to the marker, circle, and polygon
// //the openPopup() opens a popup with the text when you click on the marker, circle, and polygon
// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");

// //this creates the popup as a layer and adds it to the map
// //we use openOn instead of addTo because it closes a previously opened popup when opening a new one
// var popup = L.popup()
//     .setLatLng([51.5, -0.09])
//     .setContent("I am a standalone popup.")
//     .openOn(map);

// //this creates a popup as layers
// //the function below says that when we click on a specific lat/long it will open the popup on the map
// var popup = L.popup();
// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);
