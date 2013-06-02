/*!
 * Module dependencies
 */


var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var path = require('path');
var readdirp = require('readdirp');
var watch = require('watch');
var domain = require('domain');

/**
 * Create a `Jukebox`
 */

exports.create = function(options){
	return new Jukebox(options);
};

/**
 * Initialize a `Jukebox`
 * @constructor
 * @param {Object} options -
 */

function Jukebox(options){
	var self = this;
	EventEmitter.call(this);
	this.directory = options.directory;
	this.queue = [];
	this.selections = {};
	this.isReady = false;
	this.on('ready',function(){
		var name = self.queue.shift();
		if(name) return self._play(self._pickSongFor(name));
		self.isReady = true;
	});
	this._setup();
}

inherits(Jukebox,EventEmitter);

Jukebox.prototype.playFor = function(name){
	if(this.isReady) return this._play(this._pickSongFor(name));
	this.queue.push(name);
};

Jukebox.prototype._pickSongFor = function(name){
	var subselections = this.selections[name] || [];
	var selections = subselections.concat(this.selections['default']);
	var lucky = Math.floor(Math.random() * 10 * selections.length ) % selections.length;
	var song = selections[lucky];
	return song;
};

Jukebox.prototype._play = function(song){
	var self = this;
	this.isReady = false;
	fs.createReadStream(path.join(this.directory,song))
		.on('error',this._onerror)
		.pipe(new lame.Decoder())
		.on('error',this._onerror)
		.on('format', function (format) {
			this.pipe(new Speaker(format))
				.on('error',self._onerror)
				.on('close',function(){
					self.emit('ready');
				});
		});
};

Jukebox.prototype._setup = function(){
	var self = this;
	var optionsReaddirp = {
		root : this.directory,
		fileFilter : ['*.mp3']
	};
	readdirp(optionsReaddirp,function(err,entries){
		if(err) return this.emit('error',err);
		entries.files.forEach(function(entry){
			self.selections[entry.parentDir] = entry.path;
		});
		self.emit('ready');
	});
	// TODO wath repos folder and add new files and remove old ones from this.selections
	// var optionsWatch = {
	// 	filter : function(filename){
	// 		return filename.split('.').pop() === 'mp3'
	// 	}
	// };
	// watch.createMonitor(this.directory,optionsWatch,function(monitor){
	// 	monitor.on('created',function(filename,stat){

	// 	});
	// 	monitor.on('deleted',function(filename,stat){

	// 	});
	// });
};

Jukebox.prototype._onerror = function(err){
	this.emit('error',err);
};
