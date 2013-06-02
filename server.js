/*!
 * Module dependencies
 */

var domain = require('domain')
var http = require('http');
var express = require('express');
var jukebox = require('./jukebox');
var hasNestedProperty = require('hnp');

/**
 * Create app
 */

var app = express();

// Jukebox for the webhook
var webhookJukebox = jukebox.create({
	directory : process['DIR_SELECTIONS'] || './repos/'
});
webhookJukebox.on('error',exit);

app.post('/webhook',function(req,res,next){
	var webhookDomain = domain.create();
	webhookDomain.on('error',exit);
	webhookDomain.run(function(){
		var body = '';
		req.on('readable',function(){
			body += req.read();
		});
		req.on('end',function(){
			try{
				var push = JSON.parse(body);
			}catch(err){
				console.error(err.stack);
				return res.send(400);
			}
			if(!hasNestedProperty(push,'commits[0].author.name')){
				var err = new Error('The body of the request has an unexpected format: ' + JSON.stringify(push));
				console.error(err.stack);
				return res.send(400);
			}
			webhookJukebox.playFor(push.commits[0].author.name);
			res.send(200);
		});
		req.read(0); // kick off
	});
});

/**
 * Create HTTP server
 */

var port = process.env['PORT'] || 3000;
var server = http.createServer(app);
server.listen(port,function(){
	console.log('HTTP server listening on port ' + port );
});

/**
 * Exit
 */

function exit(err){
	console.error(err.stack);
	process.exit(1);
}