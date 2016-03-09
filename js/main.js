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

//build an attributes array from the data and process it
function processData(data){
  //empty array to hold attributes
  var attributes = [];

  //the properties holds the of the first feature of our data, which is 2008
  var properties = data.features[0].properties;

  //push each years into attributes array
  for (var attribute in properties){
    //this loops through our array and adds all of the years
    if (attribute.indexOf("20")> -1){
        attributes.push(attribute);
    };
  };
  return attributes;
};

//function to convert markers to circle markers
//Also creates a popup to the circle proportional symbols
function pointToLayer(feature, latlng, attributes){
    //Define the attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //create propSymbol and give it color and radius
    var propSymbol = {
        radius: 8,
        fillColor: "#e73019",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //Determine the year for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each cities proportionalsymbol a radius based on number of homicides
    propSymbol.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, propSymbol);

    //define the year as the attribute
    var year = attribute;

    //popup content is now just the city name
    var popupContent = feature.properties.City;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.point(0,-propSymbol.radius),
        closeButton: false
      });

    //use event listeners to open popup hovering over the proportional symbol
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
    });
    //return the proportional symbol to tour map
    return layer;
};

//this calculates teh radius of our proportional symbols based on number of homicides
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 15;
    //equation for area based on number of homicides and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//this creates proportional symbols from our lat,lng points
function createpropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//this creates a sequence control to go through each year of our homicide data
function createSequenceControls(map, attributes){
    //create a range slider
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes (length, steps, etc.)
    $('.range-slider').attr({
      max: 6,
      min: 0,
      value: 0,
      step: 1,
    });

    //add in our skip and reverse buttons and the icons of the buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //click listener for buttons
    $('.skip').click(function(){

      //get the old index value
      var index = $('.range-slider').val();

      //year increments or decrements depending on button clicked on if clicking skip or reverse
      if ($(this).attr('id') == 'forward'){
           index++;
           //If we click past 2014(last attribute), it wraps around to first attribute
           index = index > 6 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
           index--;
           //If past the first attribute, wrap around to last attribute
           index = index < 0 ? 6 : index;
         };
      //updates slider
      $('.range-slider').val(index);

      //pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
      updateLegend(map, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[0]);
    });
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
    updateLegend(map, attribute);
};

//imports our geojson data and calls it
function getData(map){
    //load the data
    $.ajax("data/CityMurders.geojson", {
        dataType: "json",
        success: function(response){

            var attributes = processData(response);

            //call functions
            createpropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
        }
    });
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the legend container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="120px">';

            //this postitions where the labels for the legend are
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

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to legend container
            $(container).append(svg);

            return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

//calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible numbers
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
function updateLegend(map, attributes){
    var year = attributes;
    //create content for legend
    var content = "Number of Homicides in " + year;

    $('#temporal-legend').html(content);

    var circleValues = getCircleValues(map, attributes);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Assign the postition and radius of the attributes
        $('#'+key).attr({
            cy: 120 - radius,
            r: radius
        });
        //Add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
      };
};

$(document).ready(createMap);
