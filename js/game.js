////////////////////////////////////////////////////////////////////
//  Global Variable Declerations
////////////////////////////////////////////////////////////////////
	var game;
    
    
    var flipFlop = false;
  
    //players
    var player1;
    var player2;
	var myId;
	var playerIndex;
    
    //turrets
    var turrets = [];
    
    var wall;
    var wallHealth;
    var wallFrequency = 0;
    
    //backgrounds
    var background;
    var weapons = [];
    
    //menus
    var upgrade_menu;
    var option_menu;
    var help_menu;
    
    //controls
    var cursors;
    var upKey1;
    var downKey1;
    var upKey2;
    var downKey2;
    var fireKey;
    var hotKey1;
    var hotKey2;
    var hotKey3;
    var hotKey4;
    var helpKey;
    var upgradeKey;
    var optKey;
    var muteKey;

    //buttons
    var upgradeButton;
	
    //turret
    var powerButton1;
    var powerButton2;
    var powerButton3;
    var powerButton4;
    var powerButton5;
	
    //guns
	
    var gunpowerButton1;
    var gunpowerButton2;
    var gunpowerButton3;
    var gunpowerButton4;
    var gunpowerButton5;
	
    var gunspeedButton1;
    var gunspeedButton2;
    var gunspeedButton3;
    var gunspeedButton4;
    var gunspeedButton5;
	
    var helpButton;
	
    var optionButton;
	var settingsButton;
    
    // enemies
    var mobs;
    var mobnumber = 5;
    var deadmobs = 0;
    
    
    //round state
    var roundstate;
    var round = 1;
    var stateText;
    var lostcount = 0;
    
    //map state
    var map = 1;
    var mapstate;
    
    //score
    var score = 0;
    var scorestate;
    
    //gold
    var gold = 0;
    var goldstate;
	
    //turret damage variable
    var turretdamage = 50;

////////////////////////////////////////////////////////////////////
//  eurecaClient Setup
////////////////////////////////////////////////////////////////////
var ready = false;
var eurecaServer;

//handles client communication with server
var eurecaClientSetup = function(){
    //create eureca.io client instance
    var eurecaClient = new Eureca.Client();
    
    eurecaClient.ready(function (proxy){
        eurecaServer = proxy;
    });
    
    //methods under "exports" become available on server side (aka heres the functions the server can call)
    eurecaClient.exports.setID = function(id, iplayerIndex){
        myId = id; //unique connection ID
        playerIndex = iplayerIndex;
        console.log(playerIndex);
        ready = true; //start handshaking
		eurecaServer.handshake(playerIndex, ready, myId);
    }    
    
    eurecaClient.exports.helloWorld = function(id, p_Id, eurecaId){
		console.log("HELLO WORLD " + p_Id);
		console.log("HELLO WORLD " + eurecaId);
	}
	
	eurecaClient.exports.spawnPlayer = function(clientId, iplayerIndex){
		game = new Phaser.Game(1920, 900, Phaser.WEBGL, 'game', {preload: preload, create: create, update: update});
		if(game != null){
			console.log("Set Game Properly");
		}
		game.boot();
	}
	
	eurecaClient.exports.movePlayerUp = function(p_Id, eurecaId, x, y){
		if(p_Id == 1){
			console.log("PLAYER 1 UP" + player1.alien.body.y);
			player1.alien.body.velocity.y = -200;
		}
		if(p_Id == 2){
			console.log("PLAYER 2 UP" + player2.alien.body.y);
			player2.alien.body.velocity.y = -200;
		}
	}
	
	eurecaClient.exports.movePlayerDown = function(p_Id, eurecaId,x,y){
		if(p_Id == 1){
			console.log("PLAYER 1 DOWN" + player1.alien.body.y);
			player1.alien.body.velocity.y = 200;
			
		}
		if(p_Id == 2){
			console.log("PLAYER 2 DOWN" + player2.alien.body.y);
			player2.alien.body.velocity.y = 200;
		}
	}
	
	eurecaClient.exports.updateState = function(p_Id, eurecaId, playerx, playery){
		if(p_Id == 1){
			player1.alien.x = x;
			player1.alien.y = y;
		}
		if(p_Id == 2){
			player2.alien.x = x;
			player2.alien.y = y;
		}
	}	
	
	eurecaClient.exports.switchWeapon = function(p_Id, weapon){
		if(p_Id == 1){
			player1.weaponSwitch(weapon);
		}
		if(p_Id == 2){
			player2.weaponSwitch(weapon);
		}
	}	
	
	eurecaClient.exports.fire = function(p_Id){
		if(p_Id == 1){
			player1.fireWeapon();
		}
		if(p_Id == 2){
			player2.fireWeapon();
		}
	}	
	
	eurecaClient.exports.placeTurret = function(){
		placeTurret();
	}
	
};


////////////////////////////////////////////////////////////////////
//  Main Player Class
////////////////////////////////////////////////////////////////////
var Player = function(game, player, index){
    console.log("Game spawning player" + index);
    this.game = game;
    this.player = player;

    //player sprite
    
    if(index === 1){ //player 1
        this.alien = game.add.sprite(27,game.world.height-400, 'alien_sprite');
    }
    else if(index === 2){ //player 2
        this.alien = game.add.sprite(125,game.world.height-400, 'alien_sprite');
    }
    this.alien.enableBody = true;
    this.game.physics.arcade.enable(this.alien); 
    this.alien.frame = 0; //rifle default animation
    this.alien.body.gravity.y = 0;
    this.alien.body.collideWorldBounds = true;
    
    this.currentWeapon = 0;
	
	//upgrades
	this.bulletdamagevar = 0;
	this.bulletspeed = 0;
	
	//gold
	this.gold = 0;
	
    //making rifle bullets
    this.rifleBullets  = [];
    this.riflenextShotAt = 0;
    this.rifleshotDelay =500;
    
    //making machine gun bullets
    this.mBullets  = [];
    this.mnextShotAt = 0;
    this.mshotDelay =200;
    
    //making rocket gun bullets
    this.rBullets  = [];
    this.rnextShotAt = 0;
    this.rshotDelay =1000;
};
////////////////////////////////////////////////////////////////////
//  Rifle Projectiles
////////////////////////////////////////////////////////////////////
Player.prototype.fireRifle = function(){
    this.rifleBullets.length;
    if(this.riflenextShotAt > this.game.time.now){
        return;
    }
    
   this.riflenextShotAt = this.game.time.now + this.rifleshotDelay;
    
     if(this.rifleBullets.length < 64){

            var bullet = this.game.add.sprite(this.alien.x + 50, this.alien.y + 53, 'rifle_projectile');
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.x = 600 + this.bulletspeed;
            bullet.damage = 35 + this.bulletdamagevar;
            this.rifleBullets.push(bullet);
            
    }
    else
    {
        this.rifleBullets = [];
    }
}
////////////////////////////////////////////////////////////////////
//  Machine Gun Projectiles
////////////////////////////////////////////////////////////////////
Player.prototype.fireMachine = function(){
    
    if(this.mnextShotAt > this.game.time.now){
        return;
    }
    
   this.mnextShotAt = this.game.time.now + this.mshotDelay;
    
     if(this.mBullets.length < 100){

            var bullet = this.game.add.sprite(this.alien.x + 50, this.alien.y + 53, 'machine_projectile');
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.x = 600 + this.bulletspeed;
            bullet.damage = 15 + this.bulletdamagevar;
            this.mBullets.push(bullet);
            
    }
    else{
        this.mBullets = [];//clear bullets
    }
};
////////////////////////////////////////////////////////////////////
//  Rocket Projectiles
////////////////////////////////////////////////////////////////////
Player.prototype.fireRocket = function(){
    
    if(this.rnextShotAt > this.game.time.now){
        return;
    }
    
   this.rnextShotAt = this.game.time.now + this.rshotDelay;
    
     if(this.rBullets.length < 100){

            var bullet = this.game.add.sprite(this.alien.x + 50, this.alien.y + 53, 'rocket_projectile');
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.x = 400 + this.bulletspeed;
            bullet.damage = 100 + this.bulletdamagevar;
            this.mBullets.push(bullet);
            
    }
    else{
        this.rBullets = [];//clear bullets
    }
};
////////////////////////////////////////////////////////////////////
//  Player update Loop
////////////////////////////////////////////////////////////////////
Player.prototype.update = function(){

    this.alien.body.velocity.set(0);
//weapon switch
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.ONE)){
		eurecaServer.switchWeapon(playerIndex, 1);
    }
    else if(this.game.input.keyboard.isDown(Phaser.Keyboard.TWO)){
		eurecaServer.switchWeapon(playerIndex, 2);
    }
    else if(this.game.input.keyboard.isDown(Phaser.Keyboard.THREE)){
		eurecaServer.switchWeapon(playerIndex, 3);
    }

//helloWorld test	
	if(this.game.input.keyboard.isDown(Phaser.Keyboard.X)){
		console.log("Trying to helloWorld");
		eurecaServer.helloWorld(playerIndex);
	}
    

//weapon fire  
	if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
            eurecaServer.fire(playerIndex);
    }
};
////////////////////////////////////////////////////////////////////
//  Player Weapon Switch
////////////////////////////////////////////////////////////////////
Player.prototype.weaponSwitch = function(weapon){
    if(weapon == 1){
        this.currentWeapon = 1;
        this.alien.frame = 0;
    }
    else if(weapon == 2){
        this.currentWeapon = 2;
        this.alien.frame = 1;
    }
    else if(weapon == 3){
        this.currentWeapon = 3;
        this.alien.frame = 2;
    }
};
////////////////////////////////////////////////////////////////////
//  Player Firing
////////////////////////////////////////////////////////////////////
Player.prototype.fireWeapon = function(){
    if(this.currentWeapon == 1){
            this.fireRifle();
    }
    else if(this.currentWeapon == 2){
            this.fireMachine();
    }
    else if(this.currentWeapon ==3){
            this.fireRocket();
    }
    else{
        this.currentWeapon = 1;
    }
};
////////////////////////////////////////////////////////////////////
//  Turret Class
////////////////////////////////////////////////////////////////////
var Turret = function(game, index){
    
    this.game = game;
    this.index = index;
    
    this.turret_sprite = game.add.sprite(225, this.index*80 + 125, 'turret_sprite');

    //making turret bullets
    this.tBullets  = [];
    this.tnextShotAt = 0;
    this.tshotDelay =500;
    this.tAmmo = 1000;

};
////////////////////////////////////////////////////////////////////
//  Turret Fire
////////////////////////////////////////////////////////////////////
Turret.prototype.fireTurret = function(){
      if(this.tnextShotAt > this.game.time.now){
        return;
    }
    
   this.tnextShotAt = this.game.time.now + this.tshotDelay;
    
     if(this.tBullets.length < this.tAmmo){

            var bullet = this.game.add.sprite(this.turret_sprite.x + 75, this.turret_sprite.y + 20, 'rifle_projectile');
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.x = 400;
            bullet.damage = turretdamage;
            this.tBullets.push(bullet);
            
    }

};
////////////////////////////////////////////////////////////////////
//  Turret Update
////////////////////////////////////////////////////////////////////
Turret.prototype.update = function(){
    this.fireTurret();
};
////////////////////////////////////////////////////////////////////
//  Place Turret
////////////////////////////////////////////////////////////////////
placeTurret = function(){
	var newturret = new Turret(game, turrets.length);
    turrets.push(newturret);
    flipFlop = true;
}
////////////////////////////////////////////////////////////////////
//  Preload
////////////////////////////////////////////////////////////////////
        function preload() {
			console.log("Preload being called...");
			if(game != null){
				console.log("GAME IS NOT NULL DAMMIT");
			}
            var asset_location = 'assets/'; //uncomment for cloud9
            //var asset_location = ''; //uncomment for compute
            
            game.load.crossOrigin = 'Anonymous';

            game.load.image('space_background', asset_location + 'space_background.jpg');
            
            //characters
            game.load.spritesheet('alien_sprite', asset_location + 'alien_spritesheet.png', 70, 99, 3);
            game.load.image('mob_sprite',asset_location + 'mob_sprite.png');
            game.load.image('boss_sprite',asset_location + 'boss_sprite.png');
            game.load.spritesheet('mob_sprite2',asset_location + 'mob_spritesheet.png', 246/3, 100);
            game.load.image('turret_sprite', asset_location + 'turret_sprite.png');
            
            //projectiles
            game.load.spritesheet('rifle_projectile',asset_location + 'rifle_projectile.png');
            game.load.spritesheet('machine_projectile',asset_location + 'machine_projectile.png');
            game.load.spritesheet('rocket_projectile',asset_location + 'rocket_projectile.png');
            
            //UI 
            game.load.image('bottom_boundry', asset_location + 'bottom_boundry.png');
            game.load.image('bothotbar_sprite',asset_location + 'bothotbar_sprite.png');
            game.load.image('lanes_top_sprite',asset_location + 'lanes_top_sprite.png');
            game.load.image('wall_moblane_sprite',asset_location + 'wall_moblane_sprite.png');
            
            //buttons
            game.load.spritesheet('upgrade_button_spritesheet', asset_location + 'upgrade_button_spritesheet.png', 193, 80);
            game.load.spritesheet('option_button_spritesheet', asset_location + 'option_button_spritesheet.png', 193, 80);
            game.load.spritesheet('help_button_spritesheet', asset_location + 'help_button_spritesheet.png', 193, 80);
            
            game.load.spritesheet('upgrade_button_spritesheet', asset_location + 'upgrade_button_spritesheet.png', 193, 80);
            game.load.spritesheet('option_button_spritesheet', asset_location + 'option_button_spritesheet.png', 193, 80);
            game.load.spritesheet('help_button_spritesheet', asset_location + 'help_button_spritesheet.png', 193, 80);
			game.load.image('power1button',asset_location + 'power1button.jpg');
			game.load.image('power2button',asset_location + 'power2button.jpg');
			game.load.image('power3button',asset_location + 'power3button.jpg');
			game.load.image('power4button',asset_location + 'power4button.jpg');
			game.load.image('power5button',asset_location + 'power5button.jpg');
			
			game.load.image('speed1button',asset_location + 'speed1button.jpg');
			game.load.image('speed2button',asset_location + 'speed2button.jpg');
			game.load.image('speed3button',asset_location + 'speed3button.jpg');
			game.load.image('speed4button',asset_location + 'speed4button.jpg');
			game.load.image('speed5button',asset_location + 'speed5button.jpg');
			
			game.load.image('settingsbutton',asset_location + 'settingsbutton.jpg');
            
            //menus
            game.load.image('upgrade_menu', asset_location + 'upgrade_menu.png');
            game.load.image('option_menu', asset_location + 'options_menu.png');
            game.load.image('help_menu', asset_location + 'help_menu.png');

        };
////////////////////////////////////////////////////////////////////
//  Create
////////////////////////////////////////////////////////////////////
        function create () {
//Physics & Background            
            game.physics.startSystem(Phaser.Physics.ARCADE);  //gives the game aracde physics

            background = game.add.sprite(0,0,'space_background');  //makes the background
            
            game.add.sprite(0, 0, 'bothotbar_sprite');//makes bottom hotbar
            game.add.sprite(0, 0, 'lanes_top_sprite');//makes top and lanes

            wall = game.add.sprite(0, 0, 'wall_moblane_sprite');//makes wall and moblanes
            //giving wall health attributes
            wall.health = 100;
          
//Making Buttons
            upgradeButton = game.add.button(game.world.centerX -100, game.world.height - 100,'upgrade_button_spritesheet', upgradeClick, game, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            upgradeButton.onInputOver.add(overUpgrade, game); //when button is hovered over
            upgradeButton.onInputOut.add(outUpgrade, game); //when button is not hovered over over
            upgradeButton.onInputUp.add(upUpgrade, game); //when finished clicking
            
            optionButton = game.add.button(game.world.width - 150, game.world.height - 100,'option_button_spritesheet', optionClick, game, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            optionButton.onInputOver.add(overOption, game); //when button is hovered over
            optionButton.onInputOut.add(outOption, game); //when button is not hovered over over
            optionButton.onInputUp.add(upOption, game); //when finished clicking
            
            helpButton = game.add.button(game.world.width - 350, game.world.height - 100,'help_button_spritesheet', helpClick, game, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            helpButton.onInputOver.add(overHelp, game); //when button is hovered over
            helpButton.onInputOut.add(outHelp, game); //when button is not hovered over over
            helpButton.onInputUp.add(upHelp, game); //when finished clicking

//Mob Physics & creation
            mobs = game.add.group();
            mobs.enableBody = true;
            createmobs();

//Keybindings
            //  Cursor keys to fly + space to fire
            game.cursors = game.input.keyboard.createCursorKeys();

            game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

            //  keybindings and controls
            cursors = game.input.keyboard.createCursorKeys();
            //up
            upKey1 = game.input.keyboard.addKey(Phaser.Keyboard.UP);
            upKey2 = game.input.keyboard.addKey(Phaser.Keyboard.W);
            //down
            downKey1 = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
            downKey2 = game.input.keyboard.addKey(Phaser.Keyboard.S);
            //space
            fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACE);
            //hotbar_keys
            hotKey1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            hotKey2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            hotKey3 = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
            hotKey4 = game.input.keyboard.addKey(Phaser.Keyboard.FOUR);
            //upgrades menu
            upgradeKey = game.input.keyboard.addKey(Phaser.Keyboard.U);
            //help menu
            helpKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
            //options
            optKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
            //mute
            muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);

            //add menu overlays
            upgrade_menu = game.add.image(game.world.centerX- 400, game.world.centerY- 400, 'upgrade_menu'); //makes upgrade menu
            upgrade_menu.visible =! upgrade_menu.visible;
            
//turret upgrade buttons
			
	    powerButton1 = game.add.button(765,255,"power1button",power1upgrade,game,0);
	    powerButton1.visible =! powerButton1.visible;
			
	    powerButton2 = game.add.button(774,330,"power2button",power2upgrade,game,0);
	    powerButton2.visible =! powerButton2.visible;
			
	    powerButton3 = game.add.button(770,410,"power3button",power3upgrade,game,0);
	    powerButton3.visible =! powerButton3.visible;
			
	    powerButton4 = game.add.button(775,490,"power4button",power4upgrade,game,0);
	    powerButton4.visible =! powerButton4.visible;
			
	    powerButton5 = game.add.button(770,565,"power5button",power5upgrade,game,0);
	    powerButton5.visible =! powerButton5.visible;
            
	    //gun upgrade buttons
			
	    gunspeedButton1 = game.add.button(920,255,"speed1button",speed1upgrade,game,0);
	    gunspeedButton1.visible =! gunspeedButton1.visible;
			
	    gunspeedButton2 = game.add.button(915,333,"speed2button",speed2upgrade,game,0);
	    gunspeedButton2.visible =! gunspeedButton2.visible;
			
	    gunspeedButton3 = game.add.button(922,405,"speed3button",speed3upgrade,game,0);
	    gunspeedButton3.visible =! gunspeedButton3.visible;
			
	    gunspeedButton4 = game.add.button(922,490,"speed4button",speed4upgrade,game,0);
	    gunspeedButton4.visible =! gunspeedButton4.visible;
			
	    gunspeedButton5 = game.add.button(922,565,"speed5button",speed5upgrade,game,0);
	    gunspeedButton5.visible =! gunspeedButton5.visible;
			
			
	    gunpowerButton1 = game.add.button(1030,255,"power1button",gunpower1upgrade,game,0);
	    gunpowerButton1.visible =! gunpowerButton1.visible;
			
	    gunpowerButton2 = game.add.button(1036,333,"power2button",gunpower2upgrade,game,0);
	    gunpowerButton2.visible =! gunpowerButton2.visible;
			
	    gunpowerButton3 = game.add.button(1030,405,"power3button",gunpower3upgrade,game,0);
	    gunpowerButton3.visible =! gunpowerButton3.visible;
			
	    gunpowerButton4 = game.add.button(1035,490,"power4button",gunpower4upgrade,game,0);
	    gunpowerButton4.visible =! gunpowerButton4.visible;
			
	    gunpowerButton5 = game.add.button(1030,565,"power5button",gunpower5upgrade,game,0);
	    gunpowerButton5.visible =! gunpowerButton5.visible;
			
			
//wall upgrade buttons
            option_menu = game.add.image(game.world.centerX- 400, game.world.centerY- 400, 'option_menu');
            option_menu.visible =! option_menu.visible;
			
			settingsButton = game.add.button(880,160,'settingsbutton',settings,game,0)
			settingsButton.visible =! settingsButton.visible;
            
            help_menu = game.add.image(game.world.centerX- 400, game.world.centerY- 400, 'help_menu');
            help_menu.visible =! help_menu.visible;
            

            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            var style2 = { font: "bold 16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            wallHealth = game.add.text(220,35, "Wall Health: " + wall.health, style);
            mapstate  = game.add.text(1680,20,map,style2);
            roundstate = game.add.text(1700,42,round,style2);
            scorestate = game.add.text(1500,25,score,style);
            goldstate = game.add.text(1400,850,gold,style);
            
            // Ending and Looping
            
            stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
            stateText.anchor.setTo(0.5, 0.5);
            stateText.visible = false;

			
			player1 = new Player(game, myId, 1);
			player2 = new Player(game, myId, 2);
        };

////////////////////////////////////////////////////////////////////
//  Wall Damage handler
////////////////////////////////////////////////////////////////////        
        function wallDamage (doDamage)
        {
            //Mob/Wall Interaction Handling
            for(var i = 0; i < mobs.length; i++)
            {
                if(mobs.getAt(i).body.x <= 500)
                {
                    mobs.getAt(i).body.velocity.set(0);
                    if(doDamage)
                    {
                        mobs.getAt(i).frame = 1; //for some reason game framing wont work....
                        //start damaging wall
                        if(wall.health > 0)
                        {
                            damageWall(i);
                            //setInterval(function(){damageWall(i);},10000);//damage wall based on particular mob index 2 sec delay
                        }
                        else
                        {
                            //var style = { font: "bold 78px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" }; 
                            //var defeat = game.add.text(0,0, "DEFEAT!", style);
                            
                            if(lostcount < 3)
                            {
                                stateText.text = "Defeated \n Click on screen to Restart Round";
                                stateText.visible = true;
            
                                game.input.onTap.addOnce(restartiflost,game);
                            }
                            
                            else if(lostcount === 3)
                            {
                                stateText.text = "Game Over";
                                stateText.visible = true;
                                
                                game.input.onTap.addOnce(gameover,game);
                            }
                            
                        }
                    }
                }
                else{
                    mobs.getAt(i).frame = 0;
                }
            }
        };
////////////////////////////////////////////////////////////////////
//  Gamestate Update Function
///////////////////////////////////////////////////////////////////

        function update () {
if(player1 != null && player2 != null){
			if(playerIndex === 1){
				player2.alien.body.velocity.set(0);
				player1.update();
				eurecaServer.updateState(playerIndex, myId, player1.alien.x, player1.alien.y);
			}
			if(playerIndex === 2){
				player1.alien.body.velocity.set(0);
				player2.update();
				eurecaServer.updateState(playerIndex, myId, player2.alien.x, player2.alien.y);
			}
		
        
        if(game.input.keyboard.isDown(Phaser.Keyboard.J)){
			console.log("Trying to helloWorld");
             eurecaServer.helloWorld(playerIndex, myId);
        }
		
		
		
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.UP) || this.game.input.keyboard.isDown(Phaser.Keyboard.W)){
			if(playerIndex ==1){
				eurecaServer.movePlayerUp(playerIndex, myId, player1.alien.x, player1.alien.y);
			}
			if(playerIndex ==2){
				eurecaServer.movePlayerUp(playerIndex, myId, player2.alien.x, player2.alien.y);
			}
		}
		
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN) || this.game.input.keyboard.isDown(Phaser.Keyboard.S)){
			if(playerIndex ==1){
				eurecaServer.movePlayerDown(playerIndex, myId, player1.alien.x, player1.alien.y);
			}
			if(playerIndex ==2){
				eurecaServer.movePlayerDown(playerIndex, myId, player2.alien.x, player2.alien.y);
			}
		}
		

        
        
//Mob/Projectile Interaction Handling            
            //for all bullets call game
            game.physics.arcade.overlap(player1.rifleBullets,mobs,collidehandler,null,game); 
            game.physics.arcade.overlap(player2.rifleBullets,mobs,collidehandler,null,game); 
            game.physics.arcade.overlap(player1.mBullets,mobs,collidehandler,null,game); 
            game.physics.arcade.overlap(player2.mBullets,mobs,collidehandler,null,game); 
            game.physics.arcade.overlap(player1.rBullets,mobs,collidehandler,null,game); 
            game.physics.arcade.overlap(player2.rBullets,mobs,collidehandler,null,game);

//turret handling            
            if(game.input.keyboard.isDown(Phaser.Keyboard.FOUR) && turrets.length < 8){
            	
            	goldneeded = 20;
		if(player1.gold < goldneeded)
		{
		
		//	
		}
                else if(!flipFlop)
                {
			player1.gold = player1.gold - 20;
			player2.gold = player2.gold - 20;
                    	eurecaServer.placeTurret();
                }
            }
            else if(!game.input.keyboard.isDown(Phaser.Keyboard.FOUR)){
                flipFlop = false;
            }
            
            for(var i = 0; i < turrets.length; i++){
                turrets[i].update();
                game.physics.arcade.overlap(turrets[i].tBullets,mobs,collidehandler,null,game);
            }
            
            
            if(wallFrequency === 120)
            {
                wallDamage(true);
                wallFrequency = 0;
            }
            else
            {
                wallDamage(false);
                wallFrequency++;
            }
            
           
            //GUI Updates
            wallHealth.setText("Wall Health: " + wall.health);
            roundstate.setText(round);
            mapstate.setText(map);
            scorestate.setText(score);
            goldstate.setText(player1.gold);
}     
    };	

	
	eurecaClientSetup();
    
////////////////////////////////////////////////////////////////////
//  Mobs/Projectiles Collision Handler
////////////////////////////////////////////////////////////////////    
    function collidehandler(projectile , mobs)
    {
        
        projectile.kill();
        mobs.health -= projectile.damage;
		
        if (mobs.health <= 0)
        {
            mobs.destroy();
            score = score + 1;
			player1.gold += 1;
			player2.gold += 1;
            deadmobs ++;
            
            if(round === 10)
            {
            	if(deadmobs === mobnumber)
		{
			stateText.text = " You Won, \n Click to Continue on the the next round";
			stateText.visible = true;
			game.input.onTap.addOnce(restart,this);
		}
		//stateText.text = " You Won, \n Click to Continue on the the next round";
                //stateText.visible = true;
		//game.input.onTap.addOnce(restart,this);
	   }
            
            if(deadmobs === mobnumber )
            {
                if(round <= 10 )
                {
                    stateText.text = " You Won, \n Click to Continue on the the next round";
                    stateText.visible = true;
                }
                
                game.input.onTap.addOnce(restart,game);
            }            
            
        }

    }
    
////////////////////////////////////////////////////////////////////
//  Mobs/Wall Collision Handler
////////////////////////////////////////////////////////////////////        
    function damageWall(index){
        //damage wall based on mob called
        if(wall.health <= 0){
            var style = { font: "bold 78px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" }; 
            var defeat = game.add.text(0,0, "DEFEAT!", style);
            console.log("DEFEAT");
        }
        else{
            //mob is now attacking wall
            wall.health = wall.health - 1;
           console.log(wall.health);
        }
    }
    
    
////////////////////////////////////////////////////////////////////
//  Mobs Spawning
////////////////////////////////////////////////////////////////////

    
     function createmobs()
     {
        switch(round){ 
		case 1:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex , wavey + 100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 10;
				wavey += 140;
			}
			break;
        case 2:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 5;
				wavey += 65;
			}
			break;
			
		case 3:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 5;
				wavey += 45;
			}
			break;
			
		case 4:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 5;
				wavey += 30;
			}
			break;
			
		case 5:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 10;
				wavey += 20;
			}
			break;
			
		case 6:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 10;
				wavey += 15;
			}
			break;
			
		case 7:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 5;
				wavey += 15;
			}
			break;
			
		case 8:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 15;
				wavey += 10;
			}
			break;
			
		case 9:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex, wavey+100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 12;
				wavey += 10;
			}
			break;
			
		case 10:
			var wavex = 50;
			var wavey = 10;
			for( var i = 0; i < mobnumber; i ++)
			{
				var mob =  mobs.create(1950 - wavex,wavey + 100,'mob_sprite');
				mob.body.velocity.x = -100;
				mob.body.gravity.y = 0;
				mob.health = 250;
				wavex += 12;
				wavey += 10;
			}
		var boss = mobs.create(1900,300,'boss_sprite');
            	boss.body.velocity.x = 75;
            	boss.body.gravity.y = 0;
            	boss.health = 10000;
				
			break;
        
		default:
		
		}	
	}
    
////////////////////////////////////////////////////////////////////
//  Button Interfaces
////////////////////////////////////////////////////////////////////
    function upgradeClick()
    {
        //on click pull up Upgrade Menu
		
	//turret
		
	powerButton1.visible =! powerButton1.visible;
	powerButton2.visible =! powerButton2.visible;
	powerButton3.visible =! powerButton3.visible;
	powerButton4.visible =! powerButton4.visible;
	powerButton5.visible =! powerButton5.visible;
		
	//gun
		
	gunpowerButton1.visible =! gunpowerButton1.visible;
	gunpowerButton2.visible =! gunpowerButton2.visible;
	gunpowerButton3.visible =! gunpowerButton3.visible;
	gunpowerButton4.visible =! gunpowerButton4.visible;
	gunpowerButton5.visible =! gunpowerButton5.visible;
		
	gunspeedButton1.visible =! gunspeedButton1.visible;
	gunspeedButton2.visible =! gunspeedButton2.visible;
	gunspeedButton3.visible =! gunspeedButton3.visible;
	gunspeedButton4.visible =! gunspeedButton4.visible;
	gunspeedButton5.visible =! gunspeedButton5.visible;
		
		
	//wall
		
		
        upgrade_menu.visible =! upgrade_menu.visible;
        //now start displaying upgrade menu
		
    }
	
   //turretupgrades
	
    function power1upgrade()
    {
	var goldneeded = 5;
	if(player1.gold < goldneeded)
	{
		//
	}
	else
	{
		console.log("Bought");
		turretdamage = turretdamage + 5;
		player1.gold -= 5;
		player2.gold -= 5;
	}
	//turretdamage = turretdamage + 5;
	
    
    }
    
    function power2upgrade()
    {
	var goldneeded = 10;
	if(player1.gold < goldneeded)
	{
		//
	}
	else
	{
		console.log("Bought");
		turretdamage = turretdamage + 10;
		player1.gold -= 10;
		player2.gold -= 10;
	}
    	
    }
    function power3upgrade()
    {
	var goldneeded = 15;
	if(player1.gold < goldneeded)
	{
		//
	}
	else
	{
		console.log("Bought");
		turretdamage = turretdamage + 15;
		player1.gold -= 15;
		player2.gold -= 15;
	}
    	
    }
    
    function power4upgrade()
    {
	var goldneeded = 20;
	if(player1.gold < goldneeded)
	{
		//
	}
	else
	{
		console.log("Bought");
		turretdamage = turretdamage + 20;
		player1.gold -= 20;
		player2.gold -= 20;
	}
    	
    }
	function power5upgrade()
	{
		var goldneeded = 50;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			turretdamage = turretdamage + 50;
			player1.gold -= 50;
			player2.gold -= 50;
		}
		
	}
	
	
	//gun upgrades
	
	function gunpower1upgrade()
	{
		var goldneeded = 5;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletdamagevar += 5;
			player2.bulletdamagevar += 5;
			player1.gold -= 5;
			player2.gold -= 5;
		}
		//turretdamage = turretdamage + 5;
		
	}
	function gunpower2upgrade()
	{
		var goldneeded = 10;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletdamagevar += 10;
			player2.bulletdamagevar += 10;
			player1.gold -= 10;
			player2.gold -= 10;
		}
		
	}
	function gunpower3upgrade()
	{
		var goldneeded = 15;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletdamagevar += 15;
			player2.bulletdamagevar += 15;
			player1.gold -= 15;
			player2.gold -= 15;
		}
		
	}
	function gunpower4upgrade()
	{
		var goldneeded = 20;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletdamagevar += 20;
			player2.bulletdamagevar += 20;
			player1.gold -= 20;
			player2.gold -= 20;
		}
		
	}
	function gunpower5upgrade()
	{
		var goldneeded = 50;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletdamagevar += 50;
			player2.bulletdamagevar += 50;
			player1.gold -= 50;
			player2.gold -= 50;
		}
		
	}
	
	function speed1upgrade()
	{
		var goldneeded = 5;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletspeed += 5;
			player2.bulletspeed += 5;
			player1.gold -= 5;
			player2.gold -= 5;
		}
	}
	
	function speed2upgrade()
	{
		var goldneeded = 10;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletspeed += 10;
			player2.bulletspeed += 10;
			player1.gold -= 10;
			player2.gold -= 10;
		}
	}
	
	function speed3upgrade()
	{
		var goldneeded = 15;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletspeed += 15;
			player2.bulletspeed += 15;
			player1.gold -= 15;
			player2.gold -= 15;
		}
	}
	
	function speed4upgrade()
	{
		var goldneeded = 20;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletspeed += 20;
			player2.bulletspeed += 20;
			player1.gold -= 20;
			player2.gold -= 20;
		}
	}
	
	function speed5upgrade()
	{
		var goldneeded = 50;
		if(player1.gold < goldneeded)
		{
			//
		}
		else
		{
			console.log("Bought");
			player1.bulletspeed += 50;
			player2.bulletspeed += 50;
			player1.gold -= 50;
			player2.gold -= 50;
		}
	}
    
 
 
    function overUpgrade(){
        //highlight upgrade button
    }
    function outUpgrade(){
         //un-highlight upgrade button
    }
    function upUpgrade(){
       console.log('button up', arguments);
    }
    
    
    function optionClick(){
		settingsButton.visible =! settingsButton.visible;
        option_menu.visible =! option_menu.visible;
    }
    function overOption(){
    }
    function outOption(){
    }
    function upOption(){
       console.log('button up', arguments);
    }
    
	function settings()
	{
		
	}
	
	
    function helpClick(){
        help_menu.visible =! help_menu.visible;
    }
    function overHelp(){
    }
    function outHelp(){
    }
    function upHelp(){
       console.log('button up', arguments);
    }
    
    function restart ()
    {
        round++;
        if(round <= 10)
        {
            mobs.removeAll();
            wall.health = 100;
            mobnumber = mobnumber + 5;
            deadmobs = 0;
            createmobs();
        
            stateText.visible = false;
        }
        else
        {
            stateText.text = " You Won, \n Game Over";
            stateText.visible = true;
        }
        
    }
    
    function restartiflost()
    {
        ++lostcount;
        mobs.removeAll();
        deadmobs = 0;
        createmobs();
        
        stateText.visible = false;
        wall.health = 100;
        
    }
    
    function gameover()
    {
        mobs.removeAll();
        stateText.text = "You have used all of your tries \n GAME OVER!";
        stateText.visible = true;
        lostcount = 0;
        round = 1;
        mobnumber = 5;
        score = 0;
        deadmobs = 0;
        wall.health = 100;
        createmobs();
        stateText.visible = false;
    }
