var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

// serve static files from the current directory
app.use(express.static(__dirname));

//we'll keep clients data here
var clients = {};

var playerIndex = 0;

var Eureca = require('eureca.io');

//ADD MORE CLIENT FUNCTIONS LATER
var eurecaServer = new Eureca.Server({allow:['setID', 'helloWorld', 'spawnPlayer']});

console.log('Print Test');

//attach eureca.io to our http server
eurecaServer.attach(server);

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
    
    playerIndex++;
	
	console.log('PlayerId=%s', playerIndex);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}
	
	//here we call setID (defined in the client side)
	remote.setID(conn.id, playerIndex);	
	//if(client calls helloWorld){
		//remote.helloWorld();
	//}
	//remote.helloWorld();
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
	
	var removeId = clients[conn.id].id;
	
	delete clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		
		//here we call kill() method defined in the client side
		//remote.kill(conn.id);
	}	
});

eurecaServer.exports.handshake = function()
{
	for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
			//send latest known position
			//var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
			//var y = clients[cc].laststate ? clients[cc].laststate.y:  0;
			var x = 0;
			var y = 0;

			//remote.spawnPlayer(clients[cc].id, index);		
		}
	}
}

eurecaServer.exports.helloWorld = function(){
      for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
			remote.helloWorld(clients[c].id);		
		}
	}
};

server.listen(12334);