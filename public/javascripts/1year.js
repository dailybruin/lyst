window.onload = function() {
  var socket = io.connect();
  
  var duration = 0;
  var sessions = 0;

  var margin = {top: 20, right: 50, bottom: 30, left: 80},
    width = $('#viz-container').width() - margin.left - margin.right-70,
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

  var svg = d3.select("#viz-container").append("svg")
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
            d3.select(this).attr("opacity", 0.7);
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
            .attr("x", width - 140)
            .attr("y", height-100)
            .attr("dy", ".35em")
            .attr("fill", "#6207C4")
            .style("font-size", "3.5rem")
            .style("text-anchor", "middle")
            .text(duration);

        legend.append("text")
            .attr("x", width - 140)
            .attr("y", height-50)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text("avg. session duration (in sec)");
    }
  }

  socket.on('365sessionsvbounces', function (message) {
    var initial = [];
    var scatter = [];
    message.forEach(function(m, i){
      initial.push({day:m[0],sessions:0,bounces:0,duration:0});
      scatter.push({day:m[0], sessions:m[1], bounces:m[2], duration:m[3]});
      duration += +m[3];
      sessions += +m[1];
    });
    duration = Math.round(duration/sessions*10)/10;
    console.log(duration);
    render(initial);
    render(scatter);
  });
  
  socket.on('365toppages', function (message) {
      if (message != undefined) {
        $("#area1").width('60%');
        $("#area1").append("<h2>Popular pages</h2>");
        $("#area1").append("<table></table>");
        for (var i = 0; i < message.length; i++) {
          $("#area1 table").append("<tr><td><a href='http://dailybruin.com"+message[i][0]
            +"'>"+ message[i][1].replace("| Daily Bruin", "")
            +"</a></td><td class='viewcount'>"+ message[i][2] +"</td></tr>");
        }
      }
  });
}
