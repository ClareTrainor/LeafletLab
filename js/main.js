//this fuction creates our leaflet map
function createMap(){
    //create the map and create the what zoom level and center it will be at
    var map = L.map('map', {
      center: [34, -98],
      zoom: 4
      });

    //adding OSM base tilelayer by CartoDB
    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      }).addTo(map);

      //setting max and min zoom options so user doesn't stray away fro mthe map
      map.options.maxZoom=12;
      map.options.minZoom=3;

      //call our data and put it on the map
      getData(map);
      statesData(map);
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
    //var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute;
    //panelContent += "<p><b>Year" + year + ":</b> " + feature.properties[attribute] + "</p>";

    //popup content is now just the city name
    var popupContent = feature.properties.City;

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
        // click: function(){
        // $('#panel').html(popupContent);
        // }
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
    });

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
        updateLegend(map, attributes[3]);
    });



    // var SequenceControl = L.Control.extend({
    //     options: {
    //         position: 'bottomleft'
    //     },
    //
    //     onAdd: function (map) {
    //         // create the control container div with a particular class name
    //         var container = L.DomUtil.create('div', 'sequence-control-container');
    //
    //         // ... initialize other DOM elements, add listeners, etc.
    //         //create range input element (slider)
    //         $(container).append('<input class="range-slider" type="range">');
    //
    //         return container;
    //     }
    // });
    // map.addControl(new SequenceControl());
};

function updatePropSymbols(map, attribute){
  map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            console.log(props)

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute
            popupContent += "<p><b>Deaths in " + year + ":</b> " + props[attribute] + " </p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
              });
        };
    });
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="120px">';

            //object to base loop
            var circles = {
                max: 30,
                mean: 60,
                min: 100
            };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#e73019" fill-opacity="0.8" stroke="#000000" cx="70"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="130" y="' + circles[circle] + '"></text>';
            };
            // //array of circle names to base loop on
            // var circles = ["max", "mean", "min"];
            //
            // //Step 2: loop to add each circle and text to svg string
            // for (var i=0; i<circles.length; i++){
            // //circle string
            // svg += '<circle class="legend-circle" id="' + circles[i] +
            // '" fill="#e73019" fill-opacity="0.9" stroke="#000000" cx="60"/>';
            //
            //
            // //text string
            // svg += '<text id="' + circles[i] + '-text" x="65" y="60"></text>';
            // };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    var year = attribute[2];
    //create content for legend
    var content = "Number of Homicides in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 120 - radius,
            r: radius
        });
        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "");
      };
};

// 2. Import GeoJSON data--done (in getData()) and call getData function
function getData(map){
    //load the data
    $.ajax("data/CityMurders.geojson", {
        dataType: "json",
        success: function(response){

            var attributes = processData(response);

            //call function to create proportional symbols
            createpropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
        }
    });
};

$(document).ready(createMap);
