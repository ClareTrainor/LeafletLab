//GOAL: Proportional symbols representing attribute values of mapped features

//1. Create the Leaflet map--done (in createMap())
function createMap(){
    //create the map
    var map = L.map('map', {
      center: [30, -98],
      zoom: 4
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

//Build an attributes array from the data
function processData(data){
  //empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //push each attribute name into attributes array
  for (var attribute in properties){
    //only take attributes with population values
    console.log(attribute);
    if (attribute.indexOf("20")> -1){
        attributes.push(attribute);
    };
  };
  //check result
  console.log(attributes);

  return attributes;
};

//this creates a popup to the circle proportional symbols
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    console.log(attribute)
    //create marker propSymbol
    var propSymbol = {
        radius: 8,
        fillColor: "#e73019",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    propSymbol.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, propSymbol);

    //origina popupContent changed to panelContent...Example 2.2 line 1
    var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute;
    panelContent += "<p><b>Year" + year + ":</b> " + feature.properties[attribute] + "</p>";

    //popup content is now just the city name
    var popupContent = feature.properties.year;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.point(0,-propSymbol.radius),
        closeButton: false
      });

    //event listeners to open popup on hover and fill pannel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
        $('#panel').html(popupContent);
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//3. Add circle markers for point features to the map--done (in AJAX callback)
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 15;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Add circle markers for point features to the map
function createpropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
      max: 6,
      min: 0,
      value: 0,
      step: 1,
    })

    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //Step 5: click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();

      //Step 6: increment or decrement depending on button clicked
      if ($(this).attr('id') == 'forward'){
           index++;
           //Step 7: if past the last attribute, wrap around to first attribute
           index = index > 6 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
           index--;
           //Step 7: if past the first attribute, wrap around to last attribute
           index = index < 0 ? 6 : index;
         };
      //Step 8: update slider
      $('.range-slider').val(index);

      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
    });
};

function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
              };
        };
    });
};

// 2. Import GeoJSON data--done (in getData())
// call getData function
function getData(map){
    //load the data
    $.ajax("data/CityMurders.geojson", {
        dataType: "json",
        success: function(response){

            var attributes = processData(response);

            //call function to create proportional symbols
            createpropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
        }
    });
};

$(document).ready(createMap);

//how do I get my year attributes to show up?
