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
   console.log("Connecting...\n");
   if(playerIndex < 3){
	   playerIndex++;
   }
   else{
	   console.log("Too many Clients, rejected connection");
	   playerIndex = 0;
	   return;
   }
    
	
	console.log('PlayerId=%s', playerIndex);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}
	
	//here we call setID (defined in the client side)
	remote.setID(conn.id, playerIndex);	
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

var p1rdy = false;
var p2rdy = false;
eurecaServer.exports.handshake = function(p_Id, ready)
{
	console.log("Handshaking...\n");
	if(p_Id == 1){
		p1rdy = ready;
	}
	else if(p_Id ==2){
		p2rdy = ready;
	}
	if(p1rdy && p2rdy){
		for (var c in clients)
		{
			var remote = clients[c].remote;
			for (var cc in clients)
			{		
				console.log("Spawning for Client: " + p_Id);
				remote.spawnPlayer(clients[cc].id, p_Id);		
			}
		}
	}	
	else{return;}
}

eurecaServer.exports.helloWorld = function(p_Id, eurecaId){
      for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
			remote.helloWorld(clients[cc].id, p_Id, eurecaId);		
		}
	}
};

server.listen(12334);