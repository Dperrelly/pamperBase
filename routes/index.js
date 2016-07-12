var express = require('express');
var path = require('path');
var router = express.Router();
var indexHtmlPath = path.join(__dirname, '../views/index.html');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(indexHtmlPath);
});

module.exports = router;
