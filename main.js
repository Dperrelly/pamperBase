const electron = require('electron');
const {app, BrowserWindow} = electron;
const express = require('express');
var path = require('path');
var serverApp = express();
var printHtmlPath = path.join(__dirname, '/print.html');

var http = require('http');

/**
 * Get port from environment and store in Express.
 */

serverApp.get('/', function(req, res, next){
	res.sendFile(__dirname + "/index.html");
});

serverApp.get('/print/:apptId', function(req, res, next) {
  	res.sendFile(printHtmlPath);
});

serverApp.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
serverApp.use('/images', express.static(path.join(__dirname, '/images')));
serverApp.use('/javascripts', express.static(path.join(__dirname, '/javascripts')));
serverApp.use('/stylesheets', express.static(path.join(__dirname, '/stylesheets')));

var server = http.createServer(serverApp);

server.listen(3000);

app.on('ready', () => {
  let win = new BrowserWindow({
  	width:1440, 
  	height: 1000,
  });
  win.loadURL(`http://localhost:3000/`);
});