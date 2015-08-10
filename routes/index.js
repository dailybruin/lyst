var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  var test;
  request('https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      test = JSON.parse(body);
      console.log(test["rows"]);
      res.render('index', { title: 'Express', test: test["rows"] });
    }
  })
});

module.exports = router;
