window.onload = function() {
  var socket = io.connect();

  var margin = {top: 20, right: 50, bottom: 30, left: 80},
    width = $('body').width() - margin.left - margin.right-70,
    height = 400 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var pointTip = d3.tip()
                  .attr('class', 'point-tip')
                  .html(function(d) {
                        return  "<p>Day: " + d.day + "</p> "
                            + "<p>Sessions: " +d.sessions + "</p> "
                            + "<p>Bounces: " +d.bounces +"</p>";
                          });

  svg.call(pointTip);

  function render(data) {
    data.forEach(function(d) {
      d.sessions = +d.sessions;
      d.bounces = +d.bounces;
      d.duration = +d.duration;
    });

    x.domain(d3.extent(data, function(d) { return d.sessions; })).nice();
    y.domain([d3.extent(data, function(d) { return d.bounces; })[0],
              d3.extent(data, function(d) { return d.bounces; })[1]]).nice();

    if (svg.selectAll(".x.axis")[0].length < 1 ){
      svg.append("g")
          .style("font-size","0.8rem")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("sessions");
    } else {
        svg.selectAll(".x.axis").transition().duration(1500).call(xAxis);
    }

    if (svg.selectAll(".y.axis")[0].length < 1 ){
      svg.append("g")
          .style("font-size","0.8rem")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("bounces");
    } else {
        svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
    }


    var dots = svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return (d.duration/100000);})
        .attr("cx", 0)
        .attr("cy", height)
        .attr("opacity", 0.7)
        .style("fill", function(d) { return color(d.day); })
        .on("mouseover", function(d) {
            pointTip.show(d);
            d3.select(this).attr("opacity", 1);
        })
        .on("mouseout", function(d) {
            pointTip.hide(d);
            d3.select(this).attr("opacity", 0.7);
        });

    dots.transition().duration(1500)
        .attr("r", function(d) { return (d.duration/100000)*2;})
        .attr("cx", function(d) { return x(d.sessions); })
        .attr("cy", function(d) { return y(d.bounces); });

    dots.exit().remove();
    // var legend = svg.selectAll(".legend")
    //     .data(color.domain())
    //   .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    //
    // legend.append("rect")
    //     .attr("x", width - 18)
    //     .attr("width", 18)
    //     .attr("height", 18)
    //     .style("fill", color);
    //
    // legend.append("text")
    //     .attr("x", width - 24)
    //     .attr("y", 9)
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "end")
    //     .text(function(d) { return d; });
  }

  socket.on('30daysessionsvbounces', function (message) {
    var initial = [];
    var scatter = [];
    message.forEach(function(m, i){
      initial.push({day:m[0],sessions:0,bounces:0,duration:0});
      scatter.push({day:m[0], sessions:m[1], bounces:m[2], duration:m[3]});
    });
    render(initial);
    render(scatter);
  });
}
