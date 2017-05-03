// Authors: Lucas Manning and Olivia Zhang
// Please use semi colons at the line ends

// Types =====================================================

var mapTypes =  {
  DISRUPTION : "Disruption",
  OPPORTUNITY : "Opportunity",
  COMBINED : "Combined"
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

var div = d3.select("body").append("div")   
    .attr("class", "tip")               
    .style("visibility", "hidden");

// Helpers======================================================

function toggleMap() {
  var label = d3.select("h1");
  var btnlabel = d3.select("#buttonlbl");
  if (currentMap == mapTypes.OPPORTUNITY) {
    label.text("Disruption");
    btnlabel.text("Show Combined Map");
    currentMap = mapTypes.DISRUPTION;
  } 
  else if (currentMap == mapTypes.DISRUPTION) {
    label.text("Combined");
    currentMap = mapTypes.COMBINED;
    btnlabel.text("Show Opportunity Map");
  } 
  else if (currentMap == mapTypes.COMBINED) {
    label.text("Opportunity");
    currentMap = mapTypes.OPPORTUNITY;
    btnlabel.text("Show Disruption Map");
  }
  changeMap(currentMap);
}

function getValueAtMSA(msaCode) {
  switch (currentMap) {
    case mapTypes.OPPORTUNITY:
      return opportunity.get(parseInt(msaCode));
      break;
    case mapTypes.DISRUPTION:
      return disruption.get(parseInt(msaCode));
      break;
    case mapTypes.COMBINED:
      return combined.get(parseInt(msaCode));
      break;
    default:
      break;
  }
}

// Fills the msa with msaCode with a color based on the map
function fillColor(msaCode, map) {
  if (opportunity.get(parseInt(msaCode)) == undefined)
     return d3.color("#aaaaaa");

  if (map == mapTypes.OPPORTUNITY) {
    var x = d3.scaleLinear().domain([8.5, 17.5]).range([0, 1])
    return d3.interpolateYlGn(((x(opportunity.get(parseInt(msaCode)))))); 
  } else if (map == mapTypes.DISRUPTION) {
    var x = d3.scaleLinear().domain([0, 3.5]).range([0, 1])
    return d3.interpolateOrRd((x(disruption.get(parseInt(msaCode))))); 
  } else if (map == mapTypes.COMBINED) {
    var x = d3.scaleLinear().domain([5.5, 17]).range([0, 1])
    return d3.interpolateBlues((x(combined.get(parseInt(msaCode))))); 
  }
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
      .on("mouseover", function(d) {
        div.html("<strong>"+currentMap+"</strong>"+"<br/>"+getValueAtMSA(msaCode))
           .style("left", (d3.event.pageX+20) + "px")     
           .style("top", (d3.event.pageY - 28) + "px")
           .style("visibility", "visible");
      })
      .on("mouseout", function(d) {
        div.style("visibility", "hidden")
      })
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
  .defer(d3.csv, "../data/combined.csv",
      function (d) { combined.set(d.area, d.combined);})
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