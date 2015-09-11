window.onload = function() {
    var socket = io.connect();

    var width = $("body").width(),
    height = 400-37;

    var points = 24;
    var lines = 3;

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
      width = $("body").width() - margin.left - margin.right;
      d3.select('svg').attr('width', $("body").width());
      x.range([0, width]);
      render(data);
    }

    var pointTip = d3.tip()
                    .attr('class', 'point-tip')
                    .html(function(d) {
                          return  "<p>" + d.name + "</p> "
                              + "<p>Hour: " +d.x * 24+ "</p> "
                              + "<p>Users: " +d.y +"</p>";
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
        if (update != null) {
            data = update;
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

        // create axis scale
        var yAxis = d3.svg.axis()
            .scale(y).orient("left");

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

       var colors = ["#3E92CC", "#2A628F", "#43217A"];
        lines.enter()
            .append("path")
            .attr("class","line")
            .attr("d",line)
            .style("stroke", function(d,i){
                  return colors[i];
              });

        lines.exit()
            .remove();

      for (var i = 0; i < data.length; i++) {
        var points = svg.selectAll(".point"+i)
              .data(data[i]);
        points.attr("class", "update point"+i)
              .transition()
              .duration(1500)
              .attr("cx", function(d) { return x(d.x); })
              .attr("cy", function(d) { return y(d.y); });

        points.enter().append("circle")
          .attr("class", "enter point"+i)
      		.attr("r", 5)
          .attr("opacity", 0.7)
          .attr("fill", colors[i])
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

    socket.on('pageviews', function (message) {
        if (message != undefined) {
          $("#area1").width('60%');
          $("#area1").html("<h2>Popular pages</h2>");
          $("#area1").append("<table></table>");
          for (var i = 0; i < message.length; i++) {
            $("#area1 table").append("<tr><td><a href='http://dailybruin.com"+message[i][0]
              +"'>"+ message[i][1].replace("| Daily Bruin", "")
              +"</a></td><td class='viewcount'>"+ message[i][2] +"</td></tr>");
          }
        }
    })

    socket.on('searchterms', function (message) {
        if (message != undefined) {
          $("#area2").width('25%');
          $("#area2").html("<h2>Popular search terms</h2>");
          $("#area2").append("<table></table>");
          for (var i = 0; i < message.length; i++) {
            $("#area2 table").append("<tr><td>"+message[i][0]
              +"</td><td class='viewcount'>"+ message[i][1] +"</td></tr>");
          }
        }
    })

    socket.on('users', function (message) {
      if (message != undefined) {
        var newusers = [];
        var oldusers = [];
        var totalusers = [];
        var temp = 0;
        for (var i = 0; i < message.length; i++) {
          if (message[i][0] == "New Visitor") {
            newusers.push({x:message[i][1]/24,
                           y:message[i][2]/1,
                           name:message[i][0]});
            temp = message[i][2]/1;
          } else if (message[i][0] == "Returning Visitor") {
            oldusers.push({x:message[i][1]/24,
                           y:message[i][2]/1,
                           name:message[i][0]});
            totalusers.push({x:message[i][1]/24,
                             y:temp+(message[i][2]/1),
                             name:message[i][0]});
          }
        }
        render([newusers,oldusers,totalusers]);
      }
    })
}
