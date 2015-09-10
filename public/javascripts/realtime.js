window.onload = function() {
  var socket = io.connect();

  var width = $("body").width() - 100,
  height = 400-37;

  var points = 180;
  var lines = 1;

  var margin = {top: 20, right:20, bottom:20, left:50};


  var svg = d3.select("#viz-container").append("svg")
      .attr("height", height)
      .attr("width", width)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.right + ")");

  var x = d3.scale.linear()
      .range([0,width - margin.left - margin.right]);

  var y = d3.scale.linear()
      .range([height - margin.top - margin.bottom,0]);

  var line = d3.svg.line()
      .x(function(d){ return x(d.x); })
      .y(function(d){ return y(d.y); });

  //make line chart responsive
  function resize() {
    width = $("body").width() - 100;
    d3.select('svg').attr('width', $("body").width() - 50);
    x.range([0, width - margin.left - margin.right]);
    render(data);
  }

  var pointTip = d3.tip()
                  .attr('class', 'point-tip')
                  .html(function(d) {
                      return "<p>Minutes ago: " +
                                Math.round((179 - (d.x * points))/6*100)/100
                                + "</p>" + "<p>Active users: " +d.y +"</p>";
                        });

  svg.call(pointTip);

  d3.select(window).on('resize', resize);

  //initialize data
  var data = [];
  for (var l = 0; l < lines; l++) {
    data.push([]);
  }

  for (var i = 0; i < points; i++) {
    for (var j = 0; j < lines; j++) {
      data[j].push({x:i/points,y:0});
    }
  }
  render(data);

  //render data with data update input
  function render(update){
      var pointList = [[]];
      if (update != null) {
          data = update;
          update.forEach(function(up){
            up.forEach(function(u, i){
              if (i%12 == 11) {
                pointList[0].push(u);
              }
            });
          });
      }
      // obtain absolute min and max
      var yMin = data.reduce(function(pv,cv){
          var currentMin = cv.reduce(function(pv,cv){
              return Math.min(pv,cv.y);
                  },100)
              return Math.min(pv,currentMin)*0.8;
                  },100);
      var yMax = data.reduce(function(pv,cv){
          var currentMax = cv.reduce(function(pv,cv){
              return Math.max(pv,cv.y);
                  },0)
              return Math.max(pv,currentMax) * 1.2;
                  },0);

      // set domain for axis
      y.domain([yMin,yMax]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      // create axis scale
      var yAxis = d3.svg.axis()
          .scale(y).orient("left");

      if (svg.selectAll(".x.axis")[0].length < 1 ){
        svg.append("g")
            .style("font-size","0.8rem")
            .attr("class", "x axis noticks")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "x label")
            .attr("x", width - 70)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("updates every 10 sec for last 30 min");
      } else {
          svg.selectAll(".x.axis").transition().duration(1500).call(xAxis);
          svg.selectAll(".x.label").transition().duration(1500).attr("x", width-70);
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

     var colors = ["#6207C4", "#2A628F", "#43217A"];
      lines.enter()
          .append("path")
          .attr("class","line")
          .attr("d",line)
          .style("stroke", function(){
              if (colors.length>0) {
                return colors.shift();
              } else {
                return '#'+Math.floor(Math.random()*16777215).toString(16);
              }
            });

      lines.exit()
          .remove();

    for (var i = 0; i < pointList.length; i++) {
      var points = svg.selectAll(".point"+i)
            .data(pointList[i]);
      points.attr("class", "update point"+i)
            .transition()
            .duration(1500)
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); });

      points.enter().append("circle")
        .attr("class", "enter point"+i)
        .attr("r", 5)
        .attr("opacity", 0.7)
        .attr("fill", "#43217A")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("name", "test")
        .on('mouseover', function(d) {
                        pointTip.show(d);
                        d3.select(this).attr("opacity", 1);
                      })
        .on('mouseout', function(d) {
                        pointTip.hide(d);
                        d3.select(this).attr("opacity", 0.7);
                      });

      points.exit()
            .remove();
    }
  }

  socket.on('realtime', function (message) {
    if (message != undefined) {
      render([message]);
    }
  });

  socket.on('realtimeStats', function (message) {
    if (message != undefined) {
      $("#area1").width('65%');
      $("#area1").html("<h2>Active page views</h2>");
      $("#area1").append("<table></table>");

      for (var i = 0; i < message["pageStats"].length; i++) {
        $("#area1 table").append("<tr><td><a href='http://dailybruin.com"
          + message["pageStats"][i].path +"'>"
          + message["pageStats"][i].title.replace("| Daily Bruin", "")
          +"</a></td><td class='viewcount'>"+ message["pageStats"][i].views +"</td></tr>");
      }

      $("#area2").width('25%');
      $("#area2").html("<h2>Active search terms</h2>");
      $("#area2").append("<table></table>");
      for (var i = 0; i < message["searchStats"].length; i++) {
        $("#area2 table").append("<tr><td>"+message["searchStats"][i].word
          +"</td><td class='viewcount'>"+ message["searchStats"][i].views +"</td></tr>");
      }

      $("#area2").append("<h2>Active sources</h2>");
      $("#area2").append("<table class='sources'></table>");
      for (var i = 0; i < message["sourceStats"].length; i++) {
        $("#area2 table.sources").append("<tr><td>"+message["sourceStats"][i].source
          +"</td><td class='viewcount'>"+ message["sourceStats"][i].views +"</td></tr>");
      }
    }
  });

  socket.emit("initialRealtime", {});
}
