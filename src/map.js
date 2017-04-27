
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var disruption = d3.map();
var opportunity = d3.map();
// Default Setting 
var curmap = disruption;

var path = d3.geoPath();
var opp_toggle = true;


var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(0, 0.01))
    .range(d3.schemeBlues[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

var colorpaths, msaMap, us_copy;

// ! Note: filepath changed because of how github packaged repo
// have an extra /disruption-map/ . . . in there
// .defer(d3.json, "../data/us_msa.json")
d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.json, "../disruption-map/data/us_msa.json")
  
    .defer(d3.csv, "../disruption-map/data/opportunity.csv", 
        function (d) { opportunity.set(d.area, d.opportunity);})
    .defer(d3.csv, "../disruption-map/data/disruption.csv", 
        function (d) { disruption.set(d.area, d.disruption);})
    .await(ready);


function fillColor(msaCode, msamap, scale) {
  if (msamap.get(parseInt(msaCode)) == undefined)
     return d3.color("gray");

  if (curmap == opportunity)
     return d3.interpolateYlGn(((msamap.get(parseInt(msaCode))-8) / scale)); 
  else 
     return d3.interpolateOrRd(((msamap.get(parseInt(msaCode))/2))); 
}


// @todo make tsv with each county and disruption index
// # Q: Where does it pass the args us, msa to ready? 
function ready(error, us, msa) {

  if (error) throw error;
  msaMap = d3.map(msa);

  //@todo need json file with MSA and their associated counties
  var g = svg.append("g").attr("class", "msa")
  
  us_copy = us;
  msaMap.each(function(countyIds, msaCode, map) {
    var selected = d3.set(countyIds);
    if (curmap.get(parseInt(msaCode)) == undefined)
      console.log("no data");

    colorpaths = g.append("path")
        .datum(topojson.merge(
          us, us.objects.counties.geometries.filter(
              function(d) { return selected.has(d.id); })))
        .attr("id", msaCode)
        .attr("class", "msa-boundary")
        .attr("fill", fillColor(msaCode, curmap, 7))
        .attr("d", path)
        .on("click", function(d) {
            d3.select("#info").text(curmap.get(parseInt(msaCode)));
        })
    });
}

  function changeView () {
      // var thepath = svg.selectAll("path")
      // path.enter().append("path")
      //       .attr("fill", fillColor(msaCode, curmap, 7))
      //       .each(function(d) {this._current = d;} );

      // path.transition()
      //       .attrTween("d", arcTween);


      // path.exit().remove()

      ready()
    

  }
// Group for the toggle button
var but_group = svg.append("g").attr("class", "toggle_button")
    .on('click', function() {
          opp_toggle = !opp_toggle
          if (curmap == opportunity) {
            alert('View Changed to Opportunity Map')
            curmap = opportunity
          }
          else {
            alert('View Changed to Disruption Map')
            curmap = disruption
          }
          //colorpaths.attr("fill", fillColor(msaCode, curmap, 7))
          changeView()
})
var button = but_group.append("rect")
    .attr("class", "button").attr("width", 120).attr("height", 30)
    .attr('x', 420) .attr('y', 10).attr("fill", '#87AFC7')
   
var label = but_group.append("text")
    .text("Toggle View").attr("width", 120).attr("height", 30)
    .attr('x', 440).attr('y', 30).style("fill", "#FFFFFF")
    


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
    
    

 

  


