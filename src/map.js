var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var disruption = d3.map();
var opportunity = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(0, 0.01))
    .range(d3.schemeBlues[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    // ! Note: had to change it bc of the way git packages my folders
    // .defer(d3.json, "../data/us_msa.json")
    // .defer(d3.csv, "../data/disruption.csv", function (d) { disruption.set(d.area, d.disruption); })
    // .defer(d3.csv, "../data/opportunity.csv", function (d) { opportunity.set(d.area, d.opportunity); })
    .defer(d3.json, "../disruption-map/data/us_msa.json")
    .defer(d3.csv, "../disruption-map/data/disruption.csv", function (d) { disruption.set(d.area, d.disruption); })
    .defer(d3.csv, "../disruption-map/data/opportunity.csv", function (d) { opportunity.set(d.area, d.opportunity); })
    .await(ready);

function fillColor(msaCode, msamap, scale) {
  if (disruption.get(parseInt(msaCode)) == undefined)
    return d3.color("gray");
  return d3.interpolateOrRd(((msamap.get(parseInt(msaCode))-8) / scale)); 
}

// @todo make tsv with each county and disruption index
function ready(error, us, msa) {
  if (error) throw error;

  var msaMap = d3.map(msa);

  // this block of code will fill all the things the color that I want. 
  // @todo make custom color function
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)

  //this block og code will create the mesh on counties that I want that gets highlighted on color
  //@todo need json file with MSA and their associated counties
  var g = svg.append("g").attr("class", "msa")
  msaMap.each(function(countyIds, msaCode) {
    var selected = d3.set(countyIds);
    if (disruption.get(parseInt(msaCode)) == undefined)
      console.log("no data");

    g.append("path")
        .datum(topojson.merge(us, us.objects.counties.geometries.filter(function(d) { return selected.has(d.id); })))
        .attr("id", msaCode)
        .attr("class", "msa-boundary")
        .attr("fill", fillColor(msaCode, opportunity, 7))
        .attr("d", path)
  });

  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
     // .attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
      .attr("d", path)
}