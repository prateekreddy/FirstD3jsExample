var margin = {top: 20, right:20, bottom:70,left:40},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

var y = d3.scale.linear().range([height, 0]);

var color = d3.scale.category10().range();

//define axis
var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

//add SVG element]
  var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "display: block; margin: 40px auto 0px")
      .append("g")
        .attr("transform", "translate("+ (margin.left+60) + ", " + margin.top + ")");

function continentChange() {

d3.select('.y').remove();
d3.selectAll('.bar').remove();

d3.json("gdpPercapitaByContinent.json", function(error, data) {

  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d,j) {
                return "<strong>GDP Per Capita in "+(1960+j)+" is</strong> <span style='color:red'>" + d.toFixed(2) + "</span>";
              });

  svg.call(tip);

var key = Object.keys(data);
  var Contdata = data[document.getElementById("contSelect").value];
  console.log(document.getElementById("contSelect").value);
  for(var j in Contdata) {
    if(Contdata[j]=="") {
      Contdata[j] = 0;
    } else {
      Contdata[j] = parseFloat(Contdata[j]);
    }
  }

  var k=-1;
  x.domain(Contdata.map(function(d) { k++; return 1960+k}));
  y.domain([0, d3.max(Contdata)]);
  console.log(d3.extent(Contdata));

  //var conti = ["Asia", "Europe", "Africa", "Oceana", "North America", "South America"];

  // svg[i].append("h2")
  //     .text(document.getElementById("contSelect").value);
  // add axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)" );

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 5)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("GDP Per Capita");



// Add bar chart
k=-1;
console.log(Contdata);
svg.selectAll("bar")
    .data(Contdata)
  .enter().append("rect")
    .style("fill", color[0])
    .attr("class", "bar")
    .attr()
    .attr("x", function(d) { k++; return x(1960+k)})
    .attr("width", x.rangeBand())
    // .attr("y",height)
    // .transition()
    // .duration(1000)
    .attr("y", function(d) { return y(d);})
    .attr("height", function(d) { return height - y(d); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

prev = Contdata;
prevY = y;

d3.select("svg").attr("width", width+100);

});
}
