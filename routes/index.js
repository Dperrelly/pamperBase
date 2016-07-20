var express = require('express');
var path = require('path');
var router = express.Router();
var indexHtmlPath = path.join(__dirname, '../views/index.html');
var printHtmlPath = path.join(__dirname, '../views/print.html');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(indexHtmlPath);
});

router.get('/print/:apptId', function(req, res, next) {
  	res.sendFile(printHtmlPath);
});

module.exports = router;
