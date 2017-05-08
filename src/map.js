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
// var disruption = d3.map();
// var opportunity = d3.map();
// var combined = d3.map();
// var topjobchange = d3.map();

let maps = {
  COMBINED : new Choropleth("Combined", d3.interpolateBlues),
  DISRUPTION : new Choropleth("Disruption", d3.interpolateOrRd),
  OPPORTUNITY : new Choropleth("Opportunity", d3.interpolateYlGn)
}
// var currentMap = mapTypes.DISRUPTION;
var currentMap = maps.DISRUPTION;



// var totalJobs = d3.map();

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
        currentMap = map;
        break;
  }


  var label = d3.select("h1");
  d3.select("#contributor").text(currentMap.name);
  d3.select("#jobgroup").text("");

  // label.text(currentMap)
  // console.log(currentMap)
  // changeMap(currentMap);




// function getValueAtMSA(msaCode, map) {
//   console.log("getValMSA")
//   console.log(totalJobs.get('$'+map))
//   if (opportunity.get(parseInt(msaCode)) == undefined)
//     return undefined;
//   switch (map) {
//     case mapTypes.OPPORTUNITY:
//       return opportunity.get(parseInt(msaCode)).value;
//     case mapTypes.DISRUPTION:
//       return disruption.get(parseInt(msaCode)).value;
//     case mapTypes.COMBINED:
//       return combined.get(parseInt(msaCode)).value;
//     default:

      
//       // return totalJobs.get(map).get(parseInt(msaCode)).value;
//       break;
//   }
// }
  var label = d3.select("h1");
  label.text(currentMap.name)


  currentMap.generateKey();


// // Fills the msa with msaCode with a color based on the map
// function fillColor(msaCode, map) {

//   if (opportunity.get(parseInt(msaCode)) == undefined)
//      return d3.color("#ffffff");
  
//   var value = getValueAtMSA(msaCode, map);

//   if (map == mapTypes.OPPORTUNITY) {
//     var x = d3.scaleLinear().domain([8.5, 17.5]).range([0, 1])
//     return d3.interpolateYlGn(((x(value)))); 
//   } 
//   else if (map == mapTypes.DISRUPTION) {
//     var x = d3.scaleLinear().domain([0, 3.5]).range([0, 1])
//     return d3.interpolateOrRd(((x(value))));
//   } 
//   else if (map == mapTypes.COMBINED) {
//     var x = d3.scaleLinear().domain([5.5, 17]).range([0, 1])
//     return d3.interpolateBlues(((x(value))));
//   }
//   else{
//     var x = d3.scaleLinear().domain([0, 500000]).range([0, 1])
//     return d3.interpolatePRGn(((x(value))));

//   }
// }
  fillMap();
}
// switches the current map displayed to the one provided
// function changeMap (map) {
//   console.log(map)

//   fillMap();
// }

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
        var text;
        if (currentMap.value(parseInt(msaCode)) == undefined)
          text = "No Data";
        else
          text = parseFloat(currentMap.value(parseInt(msaCode))).toFixed(4) + "%";

        div.html("<strong>"+currentMap.name+"</strong>"+"<br/><span class='mb-1'>"+ text + "</span>")
           .style("left", (d3.event.pageX+20) + "px")     
           .style("top", (d3.event.pageY - 28) + "px")
           .style("visibility", "visible");
      })
      .on("mouseout", function(d) {
        div.style("visibility", "hidden")
      })
      .on("click", function(d) {
          d3.select('#jobgroup').text(" Main Portion of Change: " + gettopjob(msaCode));
          d3.select('#msaCode').text(" MSA: " + msaCode);
          d3.select('#msaCode').text(" MSA: " + msaCode);

          d3.select('#jobgroup').text(" Main Portion of Change: " + gettopjob(msaCode) + " [MSA: " + msaCode + "]");



          d3.select('#jobgroup').text(" Main Portion of Change: " + currentMap.greatestSectors(parseInt(msaCode)) + " [MSA: " + msaCode + "]");

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
      })
  .defer(d3.csv, "../data/disruption.csv", 
      function (d) { 
        maps.DISRUPTION.addData(d.area, {"value" : d.disruption, "greatest_sector" : d.greatest_sector});
      })
  .defer(d3.csv, "../data/combined.csv",


      function (d) {  maps.COMBINED.addData(d.area, {"value" : d.combined, "greatest_sector" : d.greatest_sector})
                      // combined.set(d.area, d.combined);
                     // topjobchange.set(d.area, d.greatest_sector)})
  // .defer(d3.csv, "../data/job_employments.csv",
  //     function (d) { 
      
  //        for (job in d){
  //           if (job == "MSA") 
  //                 myMSA = d[job]

  //           if (!(totalJobs.has(job))){ 
  //                var temp = d3.map()
  //                totalJobs = totalJobs.set(job, temp)
                
  //              }
  //         totalJobs.get(job).set(d.MSA, d[job])
            
  //        // console.log(totalJobs.get(job))
  //         } 
     
          
  //          })  
        
    

  .await(function(error, us, msa) {
    if (error) throw error;

    for (type in maps)
      maps[type].createLinearScale();
    
    createBoundaries(us, msa);
    fillMap(currentMap);
    currentMap.generateKey();
  });
});

 

  //console.log(totalJobs.keys())
   //console.log(totalJobs.entries())
 

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