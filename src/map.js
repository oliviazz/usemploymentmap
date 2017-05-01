// Authors: Lucas Manning and Olivia Zhang
// Please use semi colons at the line ends

// Types =====================================================

var mapTypes =  {
  DISRUPTION : 0,
  OPPORTUNITY : 1,
  COMBINED : 2
};

// globals==================================================

var path = d3.geoPath();
var disruption = d3.map();
var opportunity = d3.map();
var combined = d3.map();
var currentMap = mapTypes.DISRUPTION;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map Components ========================================================

// Group for the toggle button
var but_group = svg.append("g").attr("class", "toggle_button")
    .on('click', function() {
          if (currentMap == mapTypes.OPPORTUNITY)
            currentMap = mapTypes.DISRUPTION;
          else if (currentMap == mapTypes.DISRUPTION)
            currentMap = mapTypes.OPPORTUNITY;
          changeMap(currentMap);
        }
    )

var button = but_group.append("rect")
    .attr("class", "button").attr("width", 120).attr("height", 30)
    .attr('x', 420) .attr('y', 10).attr("fill", '#87AFC7')
   
var label = but_group.append("text")
    .text("Toggle View").attr("width", 120).attr("height", 30)
    .attr('x', 440).attr('y', 30).style("fill", "#FFFFFF")
    

// Helpers======================================================

// Fills the msa with msaCode with a color based on the map
function fillColor(msaCode, map) {
  if (opportunity.get(parseInt(msaCode)) == undefined)
     return d3.color("#aaaaaa");

  if (map == mapTypes.OPPORTUNITY)
     return d3.interpolateYlGn(((opportunity.get(parseInt(msaCode))-8) / 7)); 
  else 
     return d3.interpolateOrRd(((disruption.get(parseInt(msaCode))/2))); 
}

// switches the current map displayed to the one provided
function changeMap (map) {
  var g = svg.select(".msa");
  g.selectAll("path").attr("fill",
    function() {
      return fillColor(this.id, map)
    }
  )
}

// creates a map of MSA shapes in the US
function createBoundaries(us, msa) {
  msaMap = d3.map(msa);
  var g = svg.append("g").attr("class", "msa")
  
  msaMap.each(function(countyIds, msaCode, map) {
    var selected = d3.set(countyIds);
    g.append("path")
      .datum(topojson.merge(
        us, us.objects.counties.geometries.filter(
          function(d) { return selected.has(d.id); })))
      .attr("id", msaCode)
      .attr("class", "msa-boundary")
      .attr("d", path)
  });
}

// Main =================================================================

// loads data. Only do this once because it is slow.
d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.json, "../data/us_msa.json")
  .defer(d3.csv, "../data/opportunity.csv", 
      function (d) { opportunity.set(d.area, d.opportunity);})
  .defer(d3.csv, "../data/disruption.csv", 
      function (d) { disruption.set(d.area, d.disruption);})
  .await(function(error, us, msa) {
    if (error) throw error;
    createBoundaries(us, msa);
    changeMap(currentMap);
  });

   //---------------------------
   // Append Groups for counties
   //---------------------------
   // svg.append("g")
   //    .attr("class", "states")
   //  .selectAll("path")
   //  .data(topojson.feature(us, us.objects.states).features)
   //  .enter().append("path")
   //   // .attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
   //    .attr("d", path)
   //---------------------------
   // Append Groups for counties
   //---------------------------
   // svg.append("g")
   //    .attr("class", "counties")
   //    .selectAll("path")
   //    .data(topojson.feature(us, us.objects.counties).features)
   //    .enter().append("path")
   //    .attr("d", path)
    
    

 

  


