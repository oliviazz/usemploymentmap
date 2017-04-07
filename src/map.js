var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var unemployment = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.json, "../data/us_msa.json")
    // .defer(d3.tsv, "unemployment.tsv", function(d) { unemployment.set(d.id, +d.rate); })
    .await(ready);

// @todo make tsv with each county and disruption index
function ready(error, us, msa) {
  if (error) throw error;

  msaMap = d3.map(msa);

  // this block of code will fill all the things the color that I want. 
  // @todo make custom color function
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
     // .attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
      .attr("d", path)




  //this block og code will create the mesh on counties that I want that gets highlighted on color
  //@todo need json file with MSA and their associated counties
  var g = svg.append("g").attr("class", "msa")
  msaMap.each(function(countyIds, msaCode) {
    var selected = d3.set(countyIds);
    g.append("path")
        .datum(topojson.merge(us, us.objects.counties.geometries.filter(function(d) { return selected.has(d.id); })))
        .attr("id", msaCode)
        .attr("class", "msa-boundary")
        //.attr("fill", d3.color("100"))
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