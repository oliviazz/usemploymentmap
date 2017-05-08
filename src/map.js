// Authors: Lucas Manning and Olivia Zhang
// Please use semi colons at the line ends

// Types =====================================================

class Choropleth {
  constructor(name, colorScale) {
    this.name = name;
    this.data = d3.map();
    this.colorScale = colorScale;
    this.min = 100000000;
    this.max = 0;
  }

  addData(msa, values) {
    if (msa == "") return;
    this.data.set(msa, values);
    // Record the min and max values to use for scaling
    if (parseFloat(values.value) > this.max) {
      this.max = parseFloat(values.value);
    } else if (parseFloat(values.value) < this.min) {
      this.min = parseFloat(values.value);
     }
  }

  createLinearScale() {
    this.linearScale = d3.scaleLinear().domain([this.min, this.max]).range([0, 1])
  }

  getColor(msa) {
    if (this.data.has(msa)) {
      return this.colorScale(this.linearScale(this.data.get(msa).value));
    } else {
      return "#FFFFFF";
    }
  }

  greatestSectors(msa) {
    if (this.data.has(msa))
      return this.data.get(msa).greatest_sector;
    else
      return "No Data";
  }

  value(msa) {
    if (this.data.has(msa)) {
      return this.data.get(msa).value;
    } else  {
      return undefined;
    }
  }

  generateKey() {
    let scale = d3.scaleLinear().domain([this.min, this.max]).rangeRound([600, 900])    
    let interval = (this.max - this.min) / 5;
    let ranges = [];
    let count = 0;
    for (let i = this.min; count < 5; i += interval) {
      ranges[count++] = i.toFixed(2);
    }
    let color = this.colorScale;
    let linearScale = this.linearScale;
    let width = scale(this.min + (ranges[1] - ranges[0])) - 600;
    let self = this;
    key.selectAll("*").remove();
    key.selectAll("rect")
       .data(ranges)
       .enter().append("rect")
       .attr("height", 8)
       .attr("x", function(d) {  return scale(d); })
       .attr("width", width)
       .attr("fill", function(d) { return color(linearScale(d)); });

    key.append("text")
      .attr("class", "caption")
      .attr("x", scale.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text(self.name +" rate");
    key.call(d3.axisBottom(scale)
      .tickSize(13)
      .tickFormat(function(x, i) { return i ? x : x + "%"; })
      .tickValues(ranges))
    .select(".domain")
    .remove();
  }
}

// globals==================================================
var path = d3.geoPath();
let jobCodeToText = {
  "31-0000": "Healthcare Support Occupations",
  "25-0000": "Education, Training, and Library Occupations",
  "51-0000": "Production Occupations",
  "11-0000": "Management Occupations",
  "21-0000": "Community and Social Service Occupations",
  "19-0000": "Life, Physical, and Social Science Occupations",
  "49-0000": "Installation, Maintenance, and Repair Occupations",
  "29-0000": "Healthcare Practitioners and Technical Occupations",
  "45-0000": "Farming, Fishing, and Forestry Occupations",
  "53-0000": "Transportation and Material Moving Occupations",
  "15-0000": "Computer and Mathematical Occupations",
  "41-0000": "Sales and Related Occupations",
  "17-0000": "Architecture and Engineering Occupations",
  "33-0000": "Protective Service Occupations",
  "39-0000": "Personal Care and Service Occupations",
  "23-0000": "Legal Occupations",
  "37-0000": "Building and Grounds Cleaning and Maintenance Occupations",
  "27-0000": "Arts, Design, Entertainment, Sports, and Media Occupations",
  "43-0000": "Office and Administrative Support Occupations",
  "47-0000": "Construction and Extraction Occupations",
  "35-0000": "Food Preparation and Serving Related Occupations",
  "13-0000": "Business and Financial Operations Occupations"
}

let maps = {
  COMBINED : new Choropleth("Combined", d3.interpolateBlues),
  DISRUPTION : new Choropleth("Disruption", d3.interpolateOrRd),
  OPPORTUNITY : new Choropleth("Opportunity", d3.interpolateYlGn),
  OCCUPATION: {}
}

var projDict = {};
var disruptDict = {};
var oppDict = {};
// var currentMap = mapTypes.DISRUPTION;
var currentMap = maps.DISRUPTION;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map Components ========================================================
var div = d3.select("body").append("div")   
    .attr("class", "tip")               
//TODO make this responsive
var key = svg.append("g")
             .attr("class", "key")
             .attr("transform", "translate(0,0)");

var color = d3.scaleThreshold()
    .domain(d3.range(0, 5))
    .range(d3.schemeOrRd[6]);

var x = d3.scaleLinear()
    .domain([0, 5])
    .rangeRound([600, 860]);

key.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });


key.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Disruption rate");

key.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();           
// Helpers======================================================

function toggleMap(mapName) {
  switch(mapName) {
    case "Opportunity":
        currentMap = maps.OPPORTUNITY;
        break;
    case "Disruption":
        currentMap = maps.DISRUPTION;
        break;
    case "Combined":
        currentMap = maps.COMBINED;
        break;
    default:
        // In this case mapName = occupation number 
        currentMap = maps.OCCUPATION[mapName];
        break;
  }

  var label = d3.select("h1");
  d3.select("#contributor").text(currentMap.name);
  d3.select("#jobgroup").text("");

  d3.select("#maptype").text(currentMap.name);
  if (currentMap.name.length == 7){
     label.text("Occupation Density");
     d3.select("#contributor").text(jobCodeToText[currentMap.name] + " Job ");
     d3.select("#mc").style("visibility", "hidden");
     d3.select("#ne").style("visibility", "");
     d3.select("#pd").style("visibility", "");
   }
  else{
     d3.select("#mc").style("visibility", "");
     label.text(currentMap.name);
     d3.select("#ne").style("visibility", "hidden");
     d3.select("#pd").style("visibility", "hidden");

   }

  currentMap.generateKey();

  fillMap();
}

// switches the current map displayed to the one provided
function fillMap () {
  var g = svg.select(".msa");
  g.selectAll("path").attr("fill",
    function() {
      return currentMap.getColor(parseInt(this.id));
    }
  )
}

// creates a map of MSA shapes in the US
function createBoundaries(us, msa) {
  msaMap = d3.map(msa);
  var g = svg.append("g").attr("class", "msa");
  console.log(msaMap);
  
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
        var text;
        if (currentMap.value(parseInt(msaCode)) == undefined)
          text = "No Data";
        else{
          if (currentMap.name.length != 7)
            text = parseFloat(currentMap.value(parseInt(msaCode))).toFixed(4) + "%";
          else{
            text = Math.floor(currentMap.value(parseInt(msaCode)))+ " employed ";

          }
        }

        div.html("<strong>"+currentMap.name+"</strong>"+"<br/><span class='mb-1'>"+ text + "</span>")
           .style("left", (d3.event.pageX+20) + "px")     
           .style("top", (d3.event.pageY - 28) + "px")
           .style("visibility", "visible");
      })
      .on("mouseout", function(d) {
        div.style("visibility", "hidden")
      })
      .on("click", function(d) {
          d3.select('#jobgroup').text(currentMap.greatestSectors(parseInt(msaCode)));
          //d3.select('#percentdis').text(currentMap.greatestSectors(parseInt(msaCode)));
           d3.select('#percentwork').text(currentMap.value(parseInt(msaCode)));
          d3.select("#msa").text(msaCode);
      })
  });
}

// Main =================================================================

// loads data. Only do this once because it is slow.
d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.json, "../data/us_msa.json")
  .defer(d3.csv, "../data/opportunity.csv", 
      function (d) { 
        maps.OPPORTUNITY.addData(d.area, {"value" : d.opportunity, "greatest_sector" : d.greatest_sector});
        oppDict[d.area] = d.opp;
      })
  .defer(d3.csv, "../data/disruption.csv", 
      function (d) { 
        maps.DISRUPTION.addData(d.area, {"value" : d.disruption, "greatest_sector" : d.greatest_sector});
        disruptDict[d.area] = d.disrupt;
      })
  .defer(d3.csv, "../data/combined.csv",
      function (d) { 
        maps.COMBINED.addData(d.area, {"value" : d.combined, "greatest_sector" : d.greatest_sector});
      })
   // .defer(d3.csv, "../data/proj.csv",
   //    function (d) { 
   //      for (job in d){
   //        if (!(d.MSA in projDict))
   //           projDict[d.MSA] = {};
   //         projDict[d.MSA][job] = d.job;

   //       }

   //    })
   // .defer(d3.csv, "../data/combined.csv",
   //    function (d) { 
   //      maps.PROJ.addData(d.area, {"value" : d.combined, "greatest_sector" : d.greatest_sector});
   //    })
  .defer(d3.csv, "../data/job_employments.csv",
      function (d) { 
        for (job in d){

 
            if (!(job in maps.OCCUPATION)){ 
                 
                // change color to something distinctive
                 var occMap = new Choropleth(job, d3.interpolateRdPu);
                 maps.OCCUPATION[job] = occMap;
                 console.log(maps.OCCUPATION[job]);
               }

          maps.OCCUPATION[job].addData(d.MSA, {"value": d[job]});
        }
      })
  .await(function(error, us, msa) {
    if (error) throw error;
     
    for (type in maps){
      console.log(type)
      if (type != "OCCUPATION")
        maps[type].createLinearScale();
      else
        for (job in maps["OCCUPATION"]) {
          console.log(job);
          maps["OCCUPATION"][job].createLinearScale();

        }
      }
    
    createBoundaries(us, msa);
    fillMap(currentMap);
    currentMap.generateKey();

  });

  console.log(projDict);
  console.log(disruptDict);
  console.log(oppDict);







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