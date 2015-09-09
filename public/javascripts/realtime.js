window.onload = function() {
  var socket = io.connect();
  $('#area1').append("<h2>Work in progress</h2>");

  socket.on('realtime', function (message) {
    console.log(message);
  });
}
