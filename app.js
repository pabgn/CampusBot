var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs')

var port = 3000;
var queue = []
var watchers = 0;
var playing = null;
var secondsPlaying = 10;
var secret = null;
var sleeping = false;
fs.readFile('secret.txt', 'utf8', function (err,data) {
  if (!err) {
	  secret = data;
  }
});


app.use('/', express.static('public'));




io.on('connection', function(socket){
	
	sendTotalUsers();
	socket.on('disconnect', function() { 
		deleteFromQueue();
		sendTotalUsers();	
	});
	
	socket.on('play', function(){
		if(positionQueue(socket)==null){
			queue.push(socket);
			checkQueue();
			sendTotalUsers();
		}

	});
	socket.on('move', function(data){
		if(playing===socket){
			console.log(data);
		}
	});
	
	socket.on('admin', function(data){
		if(data["secret"]==secret){
			if(data["action"]=="sleep"){
				sleepMode();
			}
			if(data["action"]=="wakeup"){
				wakeUp();
			}
			if(data["action"]=="kick"){
				kick();
			}
		}	
		
	});

});
function kick(){
	playing = null;
}
function wakeUp(){
	sleeping=false;
	sendTotalUsers();
}
function sleepMode(){
	sleeping = true;
	sendTotalUsers();
	
}
function deleteFromQueue(socket){
	for(s in queue){
		if(queue[s]===socket){
			 queue.splice(s, 1);
		}
	}
	sendTotalUsers();
}
function positionQueue(socket){
	count = 0;
	found = false;
	for(s in queue){
		if(queue[s]===socket){
			found = true;
			count++;		
		}
	}
	return found==true?count:null;
}
function checkQueue(){
	if(queue.length>0){
		if(playing==null){
			socket = queue.shift();
			socket.emit("control");
			playing=socket;
			setTimeout(function () {
			  if(playing!=null){
				  playing.emit("over");
				  playing=null;
			  }
			  checkQueue();
			  sendTotalUsers();
			}, secondsPlaying*1000);
		}
	}
	
}
function sendTotalUsers(){
	io.emit('totalUsers', {'watchers':io.engine.clientsCount, 'queue':queue.length, 'sleeping':sleeping});
	for(s in queue){
		queue[s].emit("position", {"number":parseInt(s)+1});
	}
}







http.listen(port, function(){
  console.log('listening on *:'+port);
});


