/*!
 * Module dependencies
 */

var domain = require('domain')
var http = require('http');
var express = require('express');
var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

/**
 * Create app
 */

var app = express();

app.post('/webhook',function(req,res,next){
	var webhookDomain = domain.create();
	webhookDomain.on('error',console.error);
	webhookDomain.run(function(){
		fs.createReadStream(__dirname + '/ftnidafot.mp3')
	  	.pipe(new lame.Decoder())
	  	.on('format', function (format) {
	    	this.pipe(new Speaker(format));
	  	});
	});
	res.send(200);
});

/**
 * Create HTTP server
 */

var port = process.env['PORT'] || 3000;
var server = http.createServer(app);
server.listen(port,function(){
	console.log('HTTP server listening on port ' + port );
});