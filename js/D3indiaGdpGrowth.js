//set dimensions of outer box
var margin = {top: 20, right:20, bottom:70,left:40},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

var y = d3.scale.linear().range([height, 0]);

//define axis
var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

d3.select("body").append("h1")
  .text("GDP growth of India")
  .style("text-align", "center");

//add SVG element
var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("style", "display: block; margin: 40px auto 0px")
    .append("g")
      .attr("transform", "translate("+ margin.left + ", " + margin.top + ")");

//load the data
d3.json("indiaGdpGrowth.json", function(error, data) {



  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d,j) {
                return "<strong>GDP growth in "+(1960+j)+" is</strong> <span style='color:red'>" + d.toFixed(2) + "</span>";
              });

  svg.call(tip);

for(var i in data) {
  if(data[i]=="") {
    data[i] = 0;
  } else {
    data[i] = parseFloat(data[i]);
  }
};

//specify the domain of data
var i=-1;
x.domain(data.map(function(d) { i++; return 1960+i}));
y.domain([0, d3.max(data)]);
console.log(d3.extent(data));

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
  .text("GDP Growth");



// Add bar chart
i=-1;
svg.selectAll("bar")
  .data(data)
.enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { i++; return x(1960+i)})
  .attr("width", x.rangeBand())
  .attr("y", function(d) {
              if(d>0) {
                return y(d);
              } else {
                return( height );
              } })
  .attr("height", function(d) {
                    if(d>0) {
                    return height - y(d);
                  } else {
                    console.log(d);
                    return height - y(-d);
                  } })
  .on('mouseover', tip.show)
  .on('mouseout', tip.hide);

  d3.select("svg").attr("height", height+250);

});
