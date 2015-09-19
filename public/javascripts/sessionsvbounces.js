scatterRender = function(data) {
  $("#loading").hide();
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
  
  var pointTip = d3.tip()
                  .attr('class', 'point-tip')
                  .html(function(d) {
                        return  "<p>Day: " + d.day + "</p> "
                            + "<p>Sessions: " +d.sessions + "</p> "
                            + "<p>Bounces: " +d.bounces +"</p>";
                          });

  svg.call(pointTip);
      
  var line = d3.svg.line()
      .x(function(d){ return x(d.x); })
      .y(function(d){ return y(d.y); });
      
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
        .attr("r", '0')
        .attr("cx", 0)
        .attr("cy", height/2)
        .attr("opacity", 0.5)
        .style("fill", "#6207C4")
        .on("mouseover", function(d) {
            pointTip.show(d);
            d3.select(this)
                .attr("opacity", 1);
        })
        .on("mouseout", function(d) {
            pointTip.hide(d);
            d3.select(this).attr("opacity", 0.5);
        });

    dots.transition().duration(1500)
        .attr("r", '2.5')
        .attr("cx", function(d) { return x(d.sessions); })
    
    dots.transition().duration(1500).delay(1500)
        .attr("r", '5')
        .attr("cy", function(d) { return y(d.bounces); });

    dots.exit().remove();
    
    if (data) {
        svg.selectAll(".legend").remove();
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("text")
            .attr("x", width - 120)
            .attr("y", height-100)
            .attr("dy", ".35em")
            .attr("fill", "#6207C4")
            .style("font-size", "3.5rem")
            .style("text-anchor", "middle")
            .text(duration);

        legend.append("text")
            .attr("x", width - 120)
            .attr("y", height-50)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text("avg. session duration (in sec)");
    }
}
