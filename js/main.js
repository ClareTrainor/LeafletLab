//GOAL: Proportional symbols representing attribute values of mapped features

//1. Create the Leaflet map--done (in createMap())

function createMap(){
    //create the map
    var map = L.map('map', {
      center: [36, -98],
      zoom: 5
      });

    //add OSM base tilelayer

    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
      }).addTo(map);

//call getData function
    getData(map);
};

// 2. Import GeoJSON data--done (in getData())
// call getData function

function getData(map){
    //load the data
    $.ajax("data/CityMurders.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
            calcPropRadius(attValue);
        }
    });
};

//3. Add circle markers for point features to the map--done (in AJAX callback)
      function createPropSymbols(data, map){
          //create marker options
          var geojsonMarkerOptions = {
              radius: 8,
              fillColor: "#e73019",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
          };

          //4. Determine which attribute to visualize with proportional symbols
          var attribute = "2013";

          //create a Leaflet GeoJSON layer and add it to the map
          L.geoJson(data, {
              pointToLayer: function (feature, latlng) {

                //5. For each feature, determine its value for the selected attribute
                var attValue = Number(feature.properties[attribute]);

                //Step 6: Give each feature's circle marker a radius based on its attribute value
                geojsonMarkerOptions.radius = calcPropRadius(attValue);

                return L.circleMarker(latlng, geojsonMarkerOptions);
              }
          }).addTo(map);
      };

      function calcPropRadius(attValue) {
          //scale factor to adjust symbol size evenly
          var scaleFactor = 15;
          //area based on attribute value and scale factor
          var area = attValue * scaleFactor;
          //radius calculated based on area
          var radius = Math.sqrt(area/Math.PI);

          return radius;
      };



$(document).ready(createMap);
