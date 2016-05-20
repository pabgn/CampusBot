var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 3000;
var queue = []
var watchers = 0;
var playing = null;
var secondsPlaying = 10;

app.use('/', express.static('public'));




io.on('connection', function(socket){
	
	sendTotalUsers();
	socket.on('disconnect', function() { 
		deleteFromQueue();
		sendTotalUsers();	
	});
	
	socket.on('play', function(){
		queue.push(socket);
		checkQueue();
		sendTotalUsers();

	});

});
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
	return found==true?count:queue.length;
}
function checkQueue(){
	if(queue.length>0){
		if(playing==null){
			socket = queue.shift();
			socket.emit("control");
			playing=socket;
			setTimeout(function () {
			  playing.emit("over");
			  playing=null;
			  checkQueue();
			  sendTotalUsers();
			}, secondsPlaying*1000);
		}
	}
	
}
function sendTotalUsers(socket){
	io.emit('totalUsers', {'watchers':io.engine.clientsCount, 'queue':queue.length});
	for(s in queue){
		queue[s].emit("position", {"number":parseInt(s)+1});
	}
}







http.listen(port, function(){
  console.log('listening on *:'+port);
});


