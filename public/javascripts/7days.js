window.onload = function() {
    var socket = io.connect();

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = $('body').width() - margin.left - margin.right - 70,
        height = 400 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .4);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var days = ["Monday","Tuesday","Wednesday","Thursday",
                    "Friday","Saturday","Sunday"];

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#viz-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var pointTip = d3.tip()
                    .attr('class', 'point-tip')
                    .html(function(d) {
                          return  "<p>" +d.name + "</p> "
                              + "<p>Users: " +(d.y1 - d.y0 )+"</p>";
                            });
    svg.call(pointTip);

    // var initial = [];
    // for (var i = 0; i < days.length; i++) {
    //   initial.push({date:days[i], '(direct)':0, empty2:0})
    // }
    // render(initial);

    function render(data) {
      color.domain(d3.keys(data[0]).filter(function(key) {
                    return key !== "date" &&
                           key !== "(not set)" &&
                           key !== "total" &&
                           key !== "socials"; }));


      data.forEach(function(d) {
        var add = 0;
        d.socials = color.domain()
                         .map(function(name) {
                           if (d[name] != undefined) {
                             add = +d[name];
                           }
                            return {name: name,
                                    height: add
                              }
                            });
          d.total = 0;
          d.socials.sort(compare);
      });
      data.forEach(function(d) {
          var y0 = 0;
          d.socials.forEach(function(ds) {
            var add = 0;
            ds.y0 = y0;
            y0 += ds.height;
            ds.y1 = y0;
            d.total += ds.height;
          })
          if (d.total == 0)
            d.total == 1;
      });

      x.domain(data.map(function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .style("font-size","0.8rem")
          .call(xAxis);

      if (svg.selectAll(".y.axis")[0].length < 1 ){
        svg.append("g")
            .attr("class", "y axis")
            .style("font-size","0.8rem")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size","0.8rem")
            .text("number of users per source");
      } else {
        svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
      }

      var date = svg.selectAll(".date")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; });

      var bars = date.selectAll("rect")
          .data(function(d) { return d.socials; });

        bars.enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y0); })
          .attr("height", 0 )
          .style("fill", function(d) { return color(d.name); })
          .on('mouseover', pointTip.show)
          .on('mouseout', pointTip.hide);

          bars.transition()
              .delay(function(d, i) { return i * 100; })
              .attr("y", function(d) { return y(d.y1); })
              .attr("height", function(d) { return y(d.y0) - y(d.y1); });

        bars.exit().remove();
    }

    function compare(a,b) {
      if (a.height > b.height)
        return -1;
      if (a.height < b.height)
        return 1;
      return 0;
    }

    socket.on('usersvsocial', function (message) {
        var initial = [];
        var send = [];
        for (var i = 0; i < message.length; i++) {
          var temp = {};
          var temp2 = {};
          var index = null;
          for (var j = 0; j < send.length; j++) {
            if (send[j].date == days[message[i][1]]) {
              index = j;
              break;
            }
          }
          if (index != null) {
            send[j][message[i][0]] = message[i][2];
            initial[j][message[i][0]] = "0";
          } else {
            temp.date = days[message[i][1]];
            temp2.date = days[message[i][1]];
            temp[message[i][0]] = message[i][2];
            temp2[message[i][0]] = "0";
            send.push(temp);
            initial.push(temp2);
          }
        }
        render(initial);
        render(send);
    });

    socket.on('7daypageviews', function (message) {
        if (message != undefined) {
          $("#area1").width('65%');
          $("#area1").append("<h2>Popular pages</h2>");
          $("#area1").append("<table></table>");
          for (var i = 0; i < message.length; i++) {
            $("#area1 table").append("<tr><td><a href='http://dailybruin.com"+message[i][0]
              +"'>"+ message[i][1].replace("| Daily Bruin", "")
              +"</a></td><td class='viewcount'>"+ message[i][2] +"</td></tr>");
          }
        }
    })

    socket.on('7daysearchterms', function (message) {
        if (message != undefined) {
          $("#area2").width('25%');
          $("#area2").append("<h2>Popular search terms</h2>");
          $("#area2").append("<table></table>");
          for (var i = 0; i < message.length; i++) {
            $("#area2 table").append("<tr><td>"+message[i][0]
              +"</td><td class='viewcount'>"+ message[i][1] +"</td></tr>");
          }
        }
    })
}
