window.onload = function() {
    var socket = io.connect('http://localhost:3000');

    var width = $("body").width(),
    height = 300-37;

    var points = 24;

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
      x.range([0, width]);
      render(data);
    }

    d3.select(window).on('resize', resize);

    //initialize data
    var data = [[],[]];

    for (var i = 0; i < points; i++) {
      data[0].push({x:i/points,y:0});
      data[1].push({x:i/points,y:0});
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
                .style("font-size","0.6rem")
                .call(yAxis)
                .append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", 6)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .style("font-size","0.6rem")
                .text("number of users");
        } else {
            svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
        }

        // generate line paths
        var lines = svg.selectAll(".line").data(data).attr("class","line");

        // transition from previous paths to new paths
        lines.transition().duration(1500)
            .attr("d",line);

       var colors = ["#3E92CC", "#2A628F", "13293D"];
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

        // svg.selectAll("circle.line")
        //     .data(data)
        //     .enter().append("circle")
        //     .attr("class", "point")
        //     .attr("cx", function(d) { return d.x; })
        //     .attr("cy", function(d) { return d.y; })
        //     .attr("r", 3.5);
    }


    socket.on('status', function (message) {
        render(data[0][0]);
    });

    socket.on('pageviews', function (message) {
        if (message != undefined) {
          $("#area1").width('60%');
          $("#area1").append("<h2>Popular pages</h2>");
          for (var i = 0; i < message.length; i++) {
            $("#area1").append("<p><a href='http://dailybruin.com"+message[i][0]+"'>"+ message[i][1].replace("| Daily Bruin", "") +"</a> "+ message[i][2] +"</p>");
          }
        }
    })

    socket.on('searchterms', function (message) {
        if (message != undefined) {
          $("#area2").width('25%');
          $("#area2").append("<h2>Popular search terms</h2>");
          for (var i = 0; i < message.length; i++) {
            $("#area2").append("<p>"+ message[i][0] + " " + message[i][1] +"</p>");
          }
        }
    })

    socket.on('users', function (message) {
      if (message != undefined) {
        var newusers = [];
        var oldusers = [];
        for (var i = 0; i < message.length; i++) {
          if (message[i][0] == "New Visitor") {
            newusers.push({x:message[i][1]/24,y:message[i][2]/1});
          } else if (message[i][0] == "Returning Visitor") {
            oldusers.push({x:message[i][1]/24,y:message[i][2]/1})
          }
        }
        render([newusers,oldusers]);
      }
    })
}
