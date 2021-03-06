//This is my fifth interaction operator
//Overlay of Federal Firearm Background Checks


//imports our geojson data of the state information
function statesData(map){
    //load the data
    $.ajax("data/checks.geojson", {
        dataType: "json",
        success: function(response){

          var a = L.geoJson(response, {style: style});

          var overlayMaps = {
             "Background Checks": a,
           };

           L.control.layers(null, overlayMaps).addTo(map);
        }
    });
};

//adds colors to the class breaks
function getColor(d) {
    return d > 1500000 ? '#084594' :
           d > 1000000  ? '#2171b5' :
           d > 500000  ? '#4292c6' :
           d > 100000  ? '#6baed6' :
           d > 50000   ? '#9ecae1' :
           d > 10000   ? '#c6dbef' :
           d > 1000   ? '#deebf7' :
                      '#f7fbff';
}

//calls out colors and adds them ot the states
function style(feature) {
    return {
        fillColor: getColor(feature.properties.Checks),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9
    };
}




$(document).ready(createMap);
