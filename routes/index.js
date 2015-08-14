var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      res.render('index', { title: '24 hours', test: test["rows"] });
    }
  })
});

router.get('/7days', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      console.log(test["rows"]);
      res.render('index', { title: '7 days', test: test["rows"] });
    }
  })
});

router.get('/30days', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      console.log(test["rows"]);
      res.render('index', { title: '30 days', test: test["rows"] });
    }
  })
});

router.get('/1year', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      console.log(test["rows"]);
      res.render('index', { title: '1 year', test: test["rows"] });
    }
  })
});

router.get('/custom', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      console.log(test["rows"]);
      res.render('index', { title: 'Custom query', test: test["rows"] });
    }
  })
});

module.exports = router;
