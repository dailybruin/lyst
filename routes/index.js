var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Real time", update: "every 10 seconds", javascript: "realtime.js" });
});

router.get('/yesterday', function(req, res, next) {
  res.render('default', { title: "Yesterday", 
                          update: "daily",
                          xText: "hour",
                          points: "24",
                          sessions: "sessions-yesterday",
                          users: "users-yesterday",
                          pages: "pages-yesterday",
                          sources: "sources-yesterday",
                          searches: "searches-yesterday"});
});

// feeling like 7 days isn't necessary...
// router.get('/7days', function(req, res, next) {
//   res.render('default', { title: "7 days", 
//                           update: "daily",
//                           points: "7", 
//                           sessions: "sessions-7day",
//                           users: "users-7day",
//                           pages: "pages-7day",
//                           sources: "sources-7day",
//                           searches: "searches-7day"});
// });

router.get('/30days', function(req, res, next) {
  res.render('default', { title: "30 days", 
                          update: "daily",
                          xText: "day",
                          points: "30", 
                          sessions: "sessions-30day",
                          users: "users-30day",
                          pages: "pages-30day",
                          sources: "sources-30day",
                          searches: "searches-30day"});
});

router.get('/1year', function(req, res, next) {
  res.render('default', { title: "1 year", 
                          update: "daily",
                          xText: "day",
                          points: "365", 
                          sessions: "sessions-365day",
                          users: "users-365day",
                          pages: "pages-365day",
                          sources: "sources-365day",
                          searches: "searches-365day"});
});

router.get('/custom', function(req, res, next) {
  res.render('custom', { title: "Custom query", update: "daily", javascript: "custom.js" });
});

router.get('*', function(req, res){
  res.render('404', { title: "404"});
});

module.exports = router;
