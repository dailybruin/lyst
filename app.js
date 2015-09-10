var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var CronJob = require('cron').CronJob;

var googleapis = require('googleapis'),
	JWT = googleapis.auth.JWT,
	analytics = googleapis.analytics('v3');

var SERVICE_ACCOUNT_EMAIL = '211839318900-57ulskbmk7nkq9bccf8cmi1flkuo8232@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = 'key.pem';

var authClient = new JWT(
	SERVICE_ACCOUNT_EMAIL,
	SERVICE_ACCOUNT_KEY_FILE,
	null,
	['https://www.googleapis.com/auth/analytics.readonly']
);

server.listen(3000);

app.engine('.html', require('ejs').__express);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/7days', routes);
app.use('/30days', routes);
app.use('/1year', routes);
app.use('/custom', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var realtime = [];

setInterval(function(){
  authClient.authorize(function(err, tokens) {
      if (err) {
        console.log(err);
        return;
      }
      var d = new Date();
      //bad fix for node-cron issue
      if (realtime.length == 0 ||
          Math.round(d.getTime()/1000) - realtime[realtime.length-1].time > 7) {
        analytics.data.realtime.get({
          auth: authClient,
          'ids': 'ga:44280059',
          'metrics': 'rt:activeUsers'
        }, function(err, result) {
          if (err) {
            console.log(err);
            return;
          }
          if (realtime.length >= 180) {
            realtime.shift();
            realtime.forEach(function(r, i) {
              r.x = i/180;
            })
          }
          realtime.push({x: realtime.length/180,
                         y: result["rows"][0][0],
                         time: Math.round(d.getTime()/1000)});
          console.log(realtime);
          io.sockets.emit("realtime", realtime);
        });
      }
    });
  }, 10000);

var customLimit = 100;

io.on('connection', function (socket) {
  socket.on('initialRealtime', function(message) {
    io.sockets.emit("realtime", realtime);
  })

  socket.on('custom', function (message) {
    if (message.initial) {
      socket.emit("customresponse", {result: false, error: false, limit: customLimit})
    }
    else if (customLimit > 0) {
      customLimit--;
      authClient.authorize(function(err, tokens) {
        	if (err) {
        		console.log(err);
        		return;
        	}
        	analytics.data.ga.get({
        		auth: authClient,
        		'ids': 'ga:44280059',
        		'start-date': message['startdate'],
        		'end-date': message['enddate'],
        		'metrics': message['metrics'],
            'dimensions': message['dimensions']
        	}, function(err, result) {
            if (err) {
              console.log(err.toString());
              socket.emit("customresponse", {result: false, limit: customLimit, error: err.toString()});
              return;
            }
            socket.emit("customresponse", {result: result["rows"], limit: customLimit, error: false});
        	});
      });
    }
  })

  //24 hour pageviews
  makeRequest('pageviews','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgIC6qI4KDA');
  //24 hour user by hour
  makeRequest('users','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICZ0oUKDA');
  //24 hour search terms
  makeRequest('searchterms','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgIDejJAKDA');
  //7 day users v social network
  makeRequest('usersvsocial', 'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgID4lpUKDA');

  makeRequest('7daypageviews','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgID4iYwKDA');

  makeRequest('7daysearchterms','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICZzpQKDA');

  makeRequest('30daysessionsvbounces', 'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICvyIAKDA');

  var job = new CronJob('00 01 00 * * *', function(){
      // Runs every day (Monday through Friday)
      // at 12:00:00 AM.
      //set custom limit to 100
      customLimit = 100;

      makeRequest('pageviews','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgIC6qI4KDA');
      //24 hour user by hour
      makeRequest('users','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICZ0oUKDA');
      //24 hour search terms
      makeRequest('searchterms','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgIDejJAKDA');
      //7 day users v social network
      makeRequest('usersvsocial', 'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgID4lpUKDA');

      makeRequest('7daypageviews','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgID4iYwKDA');

      makeRequest('7daysearchterms','https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICZzpQKDA');

      makeRequest('30daysessionsvbounces', 'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICvyIAKDA');
    },
    null,
    true /* Start the job right now */,
    "America/Los_Angeles" /* Time zone of this job. */
  );

  function makeRequest(emitName, queryurl) {
    var result;
    request(queryurl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        result = JSON.parse(body);
        socket.emit(emitName, result["rows"]);
      }
    })
  }
});

module.exports = app;
