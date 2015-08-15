var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  makeRequest(req, res, next,
    'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA',
                  '24 hours');
});

router.get('/7days', function(req, res, next) {
  makeRequest(req, res, next,
    'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA',
                  '7 days');
});

router.get('/30days', function(req, res, next) {
  makeRequest(req, res, next,
    'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA',
                  '30 days');
});

router.get('/1year', function(req, res, next) {
  makeRequest(req, res, next,
    'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA',
                  '1 year');
});

router.get('/custom', function(req, res, next) {
  makeRequest(req, res, next,
    'https://db-superproxy.appspot.com/query?id=ag9zfmRiLXN1cGVycHJveHlyFQsSCEFwaVF1ZXJ5GICAgICAgIAKDA',
                  'Custom query');
});

function makeRequest(req, res, next, queryurl, title) {
  var result;
  request(queryurl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      result = JSON.parse(body);
      res.render('index', { title: title, result: result["rows"] });
    }
  })
}

module.exports = router;
