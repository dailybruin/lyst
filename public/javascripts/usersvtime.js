lineRender = function(data){
    // obtain absolute min and max
    var yMin = data.reduce(function(pv,cv){
        var currentMin = cv.reduce(function(pv,cv){
            return Math.min(pv,cv.y);
                },100)
            return Math.min(pv,currentMin)*0.7;
                },100);
    var yMax = data.reduce(function(pv,cv){
        var currentMax = cv.reduce(function(pv,cv){
            return Math.max(pv,cv.y);
                },0)
            return Math.max(pv,currentMax) * 1.2;
                },0);

    // set domain for axis
    x.domain([0,1-1/points]);
    y.domain([yMin,yMax]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return Math.round(d*points)+1; })
        .tickValues(d3.range(0, 1, 1/points));

    // create axis scale
    var yAxis = d3.svg.axis()
        .scale(y).orient("left");

    if (svg.selectAll(".x.axis")[0].length < 1 ){
      svg.append("g")
          .style("font-size","0.8rem")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height) + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "x label")
          .attr("x", width-10)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("minutes ago");
    } else {
        svg.selectAll(".x.axis").transition().duration(1500).call(xAxis);
        svg.selectAll(".x.label").transition().duration(1500).attr("x", width-10);
    }

    // if no axis exists, create one, otherwise update it
    if (svg.selectAll(".y.axis")[0].length < 1 ){
        svg.append("g")
            .attr("class","y axis")
            .style("font-size","0.8rem")
            .call(yAxis)
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .style("font-size","0.8rem")
            .text("number of users");
    } else {
        svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
    }

    // generate line paths
    var lines = svg.selectAll(".line").data(data).attr("class","line");

    // transition from previous paths to new paths
    lines.transition().duration(1500)
        .attr("d",line);

   var colors = [{hex:"#6207C4"}, {hex:"#2A628F"}, {hex:"#43217A"}];
   
   data.forEach(function(d,i) {
     colors[i].name = d[0].name;
   });
   
    lines.enter()
        .append("path")
        .attr("class","line")
        .attr("d",line)
        .style("stroke", function(d, i){
              return colors[i%3].hex;
          });

    lines.exit()
        .remove();
    
    if (data[0][0].name) {
      var legend = svg.selectAll(".legend")
          .data(colors)
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d){return d.hex;});

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d.name; });
      }
}
