var str = "";
function change() {
if(document.getElementById("graph").value == "perCapita") {
  str = "perCapita ";
  d3.json("top15PerCapita.json", render);
} else {
  str="";
  d3.json("top15GniGdp.json", render);
  }
}

  var outerWidth = 1200;
  var outerHeight = 510;
  var margin = { left: 90, top: 30, right: 30, bottom: 40 };
  var barPadding = 0.2;



  var xColumn = "year",
      yColumn = "perCapita",
      layerColumn = "country",
      colorColumn = layerColumn;

  var innerWidth  = outerWidth  - margin.left - margin.right;
  var innerHeight = outerHeight - margin.top  - margin.bottom;

  var svg = d3.select("body").append("svg")
            .attr("width",  outerWidth)
            .attr("height", outerHeight)
            .style("display", "block")
            .style("margin", "auto");
  var g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xAxisG = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerHeight + ")");
  var yAxisG = g.append("g")
            .attr("class", "y axis");


  var colorLegendG = g.append("g")
                  .attr("class", "color-legend")
                  .attr("transform", "translate(100, 500)");


  var siFormat = d3.format("s");
  var customTickFormat = function (d) {
                        return siFormat(d).replace("T", ",000B");
                      };

  var xScale = d3.scale.ordinal().rangeBands([0, innerWidth], barPadding);
  var yScale = d3.scale.linear().range([innerHeight, 0]);
  var colorScale = d3.scale.category20();

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        .outerTickSize(0);
  var yAxis = d3.svg.axis().scale(yScale).orient("left")
              .ticks(10)
              .outerTickSize(0)
              .tickFormat(customTickFormat);
  var colorLegend = d3.legend.color()
                  .scale(colorScale)
                  .shapePadding(40)
                  .shapeWidth(15)
                  .shapeHeight(15)
                  .labelOffset(4)
                  .orient("horizontal");


  function render(data) {
    //processing the data to a particular format
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                  return "<strong>GDP + GNI "+str+"of "+d.country+" in "+d.year+" is</strong> <span style='color:red'>" + d.y.toFixed(2) + "</span>";
                });

    svg.call(tip);
    var countries = Object.keys(data),
        newData = [];

    for( var i in countries) {
      var temp = {};
          temp.values=[];
      temp.key = countries[i];
    for( var j in data[countries[i]]) {
      if(!data[countries[i]][j])
        data[countries[i]][j] = 0;
      temp.values.push({"country" : countries[i],
                          "year" : 1960+ +j,
                          "perCapita" : data[countries[i]][j]});
      }
    newData.push(temp);
    }
    data = newData;



    var stack = d3.layout.stack()
                .y(function (d) { return d[yColumn]; })
                .values(function (d) { return d.values; });

    var layers = stack(data);

    xScale.domain(layers[0].values.map(function (d) { return d[xColumn]; }));

    yScale.domain([0, 4000+d3.max(layers, function (layer) {
          return d3.max(layer.values, function (d) {
        return d.y0 + d.y;
        });
      })
    ]);

    colorScale.domain(layers.map(function (layer) {
      return layer.key;
    }));

    xAxisG.call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .style("font-size", "13px")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );
    yAxisG.call(yAxis)
          .selectAll("text")
          .style("font-size", "13px");

    var layerGroups = g.selectAll(".layer").data(layers);
    layerGroups.enter().append("g").attr("class", "layer");
    layerGroups.exit().remove();
    layerGroups.style("fill", function (d) {
      return colorScale(d.key);
    });

    var bars = layerGroups.selectAll("rect").data(function (d) {
      return d.values;
    });
    bars.enter().append("rect")
    bars.exit().remove();
    bars
      .attr("x", function (d) { return xScale(d[xColumn]); })
      // .attr("y", innerHeight)
      // .transition()
      // .duration(1000)
      .attr("y", function (d) { return yScale(d.y0 + d.y); })
      .attr("width", xScale.rangeBand())
      .attr("height", function (d) { return innerHeight - yScale(d.y); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  colorLegendG.call(colorLegend);
  d3.select("svg").attr("height", innerHeight+120);
  }
