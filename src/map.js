// Authors: Lucas Manning and Olivia Zhang
// Please use semi colons at the line ends

// Types =====================================================

var mapTypes =  {
  DISRUPTION : "Disruption",
  OPPORTUNITY : "Opportunity",
  COMBINED : "Combined"
};

// globals==================================================
var scales = {
    'puOr11': ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    'spectral8': ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
    'redBlackGreen': ['#ff0000', '#AA0000', '#550000', '#005500', '#00AA00', '#00ff00'],
    'viridis': ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"]
};
var path = d3.geoPath();
var disruption = d3.map();
var opportunity = d3.map();
var combined = d3.map();
var topjobchange = d3.map();
var currentMap = mapTypes.DISRUPTION;


var totalJobs = d3.map();

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map Components ========================================================

var div = d3.select("body").append("div")   
    .attr("class", "tip")               
    .style("visibility", "hidden");
// Legend =====================================================

// var legendSvg = d3.select('#legend-svg')
//         .attr('width', 70)
//         .attr('height', 30)
//         .append('g');

    // updateColourScale(scales['puOr11']);

// function updateColourScale(scale) {

//       var legendFullHeight = 400;
//       var legendFullWidth = 50;

//       var legendMargin = { top: 20, bottom: 20, left: 5, right: 20 };

//       // use same margins as main plot
//       var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;
//       var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;
//         // create colour scale
//         var colorScale = d3.scale.linear()
//             .domain(linspace(-3, 3, scale.length))
//             .range(scale);

//         // clear current legend
//         legendSvg.selectAll('*').remove();

//         // append gradient bar
//         var gradient = legendSvg.append('defs')
//             .append('linearGradient')
//             .attr('id', 'gradient')
//             .attr('x1', '0%') // bottom
//             .attr('y1', '100%')
//             .attr('x2', '0%') // to top
//             .attr('y2', '0%')
//             .attr('spreadMethod', 'pad');

//         // programatically generate the gradient for the legend
//         // this creates an array of [pct, colour] pairs as stop
//         // values for legend
//         var pct = linspace(0, 100, scale.length).map(function(d) {
//             return Math.round(d) + '%';
//         });

//         var colourPct = d3.zip(pct, scale);

//         colourPct.forEach(function(d) {
//             gradient.append('stop')
//                 .attr('offset', d[0])
//                 .attr('stop-color', d[1])
//                 .attr('stop-opacity', 1);
//         });

//         legendSvg.append('rect')
//             .attr('x1', 0)
//             .attr('y1', 0)
//             .attr('width', legendWidth)
//             .attr('height', legendHeight)
//             .style('fill', 'url(#gradient)');

//         // create a scale and axis for the legend
//         var legendScale = d3.scale.linear()
//             .domain([-3, 3])
//             .range([legendHeight, 0]);

//         var legendAxis = d3.svg.axis()
//             .scale(legendScale)
//             .orient("right")
//             .tickValues(d3.range(-3, 4));
//             // .tickFormat(d3.format("d"));

//         legendSvg.append("g")
//             .attr("class", "legend axis")
//             .attr("transform", "translate(" + legendWidth + ", 0)")
//             .call(legendAxis);

//          updateColourScale(scales['puOr11']);

//         // attach event listener to control
//         d3.select('#scale-select').on('change', function() {
//           var val = d3.select(this).node().value;
//           updateColourScale(scales[val]);
//       });
//     }
// Helpers======================================================

function toggleMap(map) {

   // if (map != "Opportunity" && map != "Disruption" && map != "Combined" ) {
   //  console.log(map)
   //  console.log(totalJobs)
    
   // }
   // else { 
  switch(map) {
    case "Opportunity":

        currentMap = mapTypes.OPPORTUNITY;
        break;
    case "Disruption":
        currentMap = mapTypes.DISRUPTION;
        break;
    case "Combined":
        currentMap = mapTypes.COMBINED;
        break;
    default:
        currentMap = map;
        break;
  }


  var label = d3.select("h1");
  d3.select("#contributor").text(currentMap);
  d3.select("#jobgroup").text("");
  label.text(currentMap)
  console.log(currentMap)
  changeMap(currentMap);
}



function getValueAtMSA(msaCode, map) {
  console.log("getValMSA")
  console.log(totalJobs.get('$'+map))
  if (opportunity.get(parseInt(msaCode)) == undefined)
    return undefined;
  switch (map) {
    case mapTypes.OPPORTUNITY:
      return opportunity.get(parseInt(msaCode)).value;
    case mapTypes.DISRUPTION:
      return disruption.get(parseInt(msaCode)).value;
    case mapTypes.COMBINED:
      return combined.get(parseInt(msaCode)).value;
    default:

      
      // return totalJobs.get(map).get(parseInt(msaCode)).value;
      break;
  }
}

function gettopjob(msaCode) {
  if (opportunity.get(parseInt(msaCode)) == undefined)
    return undefined;
  switch (currentMap) {
    case mapTypes.OPPORTUNITY:
      return opportunity.get(parseInt(msaCode)).greatest_sector;
    case mapTypes.DISRUPTION:
      return disruption.get(parseInt(msaCode)).greatest_sector;
    case mapTypes.COMBINED:
      return combined.get(parseInt(msaCode)).greatest_sector;
    default:
      break;
  }
}

// Fills the msa with msaCode with a color based on the map
function fillColor(msaCode, map) {

  if (opportunity.get(parseInt(msaCode)) == undefined)
     return d3.color("#ffffff");
  
  var value = getValueAtMSA(msaCode, map);

  if (map == mapTypes.OPPORTUNITY) {
    var x = d3.scaleLinear().domain([8.5, 17.5]).range([0, 1])
    return d3.interpolateYlGn(((x(value)))); 
  } 
  else if (map == mapTypes.DISRUPTION) {
    var x = d3.scaleLinear().domain([0, 3.5]).range([0, 1])
    return d3.interpolateOrRd(((x(value))));
  } 
  else if (map == mapTypes.COMBINED) {
    var x = d3.scaleLinear().domain([5.5, 17]).range([0, 1])
    return d3.interpolateBlues(((x(value))));
  }
  else{
    var x = d3.scaleLinear().domain([0, 500000]).range([0, 1])
    return d3.interpolatePRGn(((x(value))));

  }
}

// switches the current map displayed to the one provided
function changeMap (map) {
  console.log(map)
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
        var text;
        if (getValueAtMSA(msaCode) == undefined) {
          text = "No data";
        } else {
          text = parseFloat(getValueAtMSA(msaCode)).toFixed(4) + "%";
        }
        div.html("<strong>"+currentMap+"</strong>"+"<br/><span class='mb-1'>"+ text + "</span>")
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


      })
  });
}

// Main =================================================================

// loads data. Only do this once because it is slow.
d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.json, "../data/us_msa.json")
  .defer(d3.csv, "../data/opportunity.csv", 
      function (d) { opportunity.set(d.area, {"value" : d.opportunity, "greatest_sector" : d.greatest_sector});})
  .defer(d3.csv, "../data/disruption.csv", 
      function (d) { disruption.set(d.area, {"value" : d.disruption, "greatest_sector" : d.greatest_sector});})
  .defer(d3.csv, "../data/combined.csv",

      function (d) { combined.set(d.area, d.combined);
                      topjobchange.set(d.area, d.greatest_sector)})
  .defer(d3.csv, "../data/job_employments.csv",
      function (d) { 
      
         for (job in d){
            if (job == "MSA") 
                  myMSA = d[job]

            if (!(totalJobs.has(job))){ 
                 var temp = d3.map()
                 totalJobs = totalJobs.set(job, temp)
                
               }
          totalJobs.get(job).set(d.MSA, d[job])
            
         // console.log(totalJobs.get(job))
          } 
     
          
           })  
        
  .await(function(error, us, msa) {
    if (error) throw error;
    createBoundaries(us, msa);
    changeMap(currentMap);
  });

 

   console.log(disruption.keys())
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