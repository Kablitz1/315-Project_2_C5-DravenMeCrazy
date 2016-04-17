////////////////////////////////////////////////////////////////////
//  Global Variable Declerations
////////////////////////////////////////////////////////////////////
    var game = new Phaser.Game(1920, 900, Phaser.AUTO, 'game');
    
    
    var flipFlop = false;
    

	var myId;
    //players
    var player1;
    var player2;
	var playerId;
	//var myplayerId;
    
    //turrets
    var turrets = [];
    var tindex = 0;
    
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
    eurecaClient.exports.setID = function(id, playerIndex){
        myId = id; //unique connection ID
        playerId = playerIndex;
        console.log(playerId);
        game.state.add('game', PhaserGame, true);
        //PhaserGame.create(); //create method of game, need to define for this instance
        //eurecaServer.handshake();
        ready = true; //start handshaking
    }    
    
    eurecaClient.exports.helloWorld = function(id, p_Id, eurecaId){
		console.log("HELLO WORLD " + p_Id);
		console.log("HELLO WORLD " + eurecaId);
	}
 
//basically any functions that server needs to call will be defined here    
    eurecaClient.exports.updateState = function(id, state){
        PhaserGame.update();
    }
    
    eurecaClient.exports.startNextRound = function(startBool){
        
    };
    eurecaClient.exports.playerFire = function(player_index){
        
    };
    eurecaClient.exports.playerSwitchWeapon1 = function(){
        
    };
    eurecaClient.exports.playerSwitchWeapon2 = function(){
        
    };
    eurecaClient.exports.playerSwitchWeapon3 = function(){
        
    };
    eurecaClient.exports.playerMoveUp = function(){
        
    };
    eurecaClient.exports.playerMoveDown = function(){
        
    };
    eurecaClient.exports.playerPlaceTurret = function(){
        
    };
};


////////////////////////////////////////////////////////////////////
//  Main Player Class
////////////////////////////////////////////////////////////////////
var Player = function(game, player, index){
    
    this.game = game;
    this.player = player;

    //player sprite
    
    if(index === 1){ //player 1
        this.alien = game.add.sprite(27,game.world.height-400, 'alien_sprite');
    }
    else if(index === 2){ //player 2
        this.alien = game.add.sprite(125,game.world.height-500, 'alien_sprite');
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

Player.prototype.update = function(){
     this.alien.body.velocity.set(0);
            
    if (upKey1.isDown || upKey2.isDown){
        if(this.alien.body.y >= 80){
            this.alien.body.velocity.y = -this.game.speed;
        }
    }
    else if (downKey1.isDown || downKey2.isDown){
        if(this.alien.body.y <= this.game.world.height - 200){
            this.alien.body.velocity.y = this.game.speed;
        }
    }

//weapon switch
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.ONE)){
        this.currentWeapon = 1;
        this.alien.frame = 0;
    }
    else if(this.game.input.keyboard.isDown(Phaser.Keyboard.TWO)){
        this.currentWeapon = 2;
        this.alien.frame = 1;
    }
    else if(this.game.input.keyboard.isDown(Phaser.Keyboard.THREE)){
        this.currentWeapon = 3;
        this.alien.frame = 2;
    }
	
	if(this.game.input.keyboard.isDown(Phaser.Keyboard.X)){
		eurecaServer.helloWorld(playerId);
	}
	
    

//weapon fire    
    if(this.currentWeapon == 1){
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
            this.fireRifle();
        }
    }
    else if(this.currentWeapon == 2){
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
            this.fireMachine();
        }
    }
    else if(this.currentWeapon ==3){
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
            this.fireRocket();
        }
    }
    else{
        this.currentWeapon = 1;
    }
};

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

Turret.prototype.update = function(){
    this.fireTurret();
};

////////////////////////////////////////////////////////////////////
//  Game State Structure
////////////////////////////////////////////////////////////////////
var GameState = function(){
    this.mobs = mobs;
    this.turrets = turrets;
    this.player1 = player1;
    this.player2 = player2;
    this.wallHealth = wallHealth;
    this.round = roundstate;
    this.map = mapstate;
    this.score = scorestate;
    this.gold = goldstate;
};

////////////////////////////////////////////////////////////////////
//  Main Game Loop
////////////////////////////////////////////////////////////////////
    var PhaserGame = function () {

        //this.background = null;

        this.player1 = null;
        this.player2 = null;
        this.cursors = null;
        this.speed = 300;
        //this.bullet = null;

        this.weapons = [];
        this.currentWeapon = 0;
        this.weaponName = null;
        

    };

    PhaserGame.prototype = {
        
////////////////////////////////////////////////////////////////////
//  Preload
////////////////////////////////////////////////////////////////////
        preload: function () {

            var asset_location = 'assets/'; //uncomment for cloud9
            //var asset_location = ''; //uncomment for compute
            
            this.load.crossOrigin = 'anonymous';

            game.load.image('space_background', asset_location + 'space_background.jpg');
            
            //characters
            game.load.spritesheet('alien_sprite', asset_location + 'alien_spritesheet.png', 70, 99, 3);
            game.load.image('mob_sprite',asset_location + 'mob_sprite.png');
            game.load.image('boss_sprite',asset_location + 'boss_sprite.png');
            game.load.spritesheet('mob_sprite2',asset_location + 'mob_spritesheet.png', 246/3, 100);
            game.load.image('turret_sprite', asset_location + 'turret_sprite.png');
            
            //projectiles
            this.load.spritesheet('rifle_projectile',asset_location + 'rifle_projectile.png');
            this.load.spritesheet('machine_projectile',asset_location + 'machine_projectile.png');
            this.load.spritesheet('rocket_projectile',asset_location + 'rocket_projectile.png');
            
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
            
            //menus
            game.load.image('upgrade_menu', asset_location + 'upgrade_menu.png');
            game.load.image('option_menu', asset_location + 'options_menu.png');
            game.load.image('help_menu', asset_location + 'help_menu.png');

        },


////////////////////////////////////////////////////////////////////
//  Create
////////////////////////////////////////////////////////////////////
        create: function () {
            //eurecaClientSetup();
//Physics & Background            
            this.physics.startSystem(Phaser.Physics.ARCADE);  //gives the game aracde physics

            background = game.add.sprite(0,0,'space_background');  //makes the background
            
            this.add.sprite(0, 0, 'bothotbar_sprite');//makes bottom hotbar
            this.add.sprite(0, 0, 'lanes_top_sprite');//makes top and lanes
            
            
            wall = this.add.sprite(0, 0, 'wall_moblane_sprite');//makes wall and moblanes
            //giving wall health attributes
            wall.health = 100;
          
//Making Buttons
            upgradeButton = game.add.button(game.world.centerX -100, game.world.height - 100,'upgrade_button_spritesheet', upgradeClick, this, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            upgradeButton.onInputOver.add(overUpgrade, this); //when button is hovered over
            upgradeButton.onInputOut.add(outUpgrade, this); //when button is not hovered over over
            upgradeButton.onInputUp.add(upUpgrade, this); //when finished clicking
            
            optionButton = game.add.button(game.world.width - 150, game.world.height - 100,'option_button_spritesheet', optionClick, this, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            optionButton.onInputOver.add(overOption, this); //when button is hovered over
            optionButton.onInputOut.add(outOption, this); //when button is not hovered over over
            optionButton.onInputUp.add(upOption, this); //when finished clicking
            
            helpButton = game.add.button(game.world.width - 350, game.world.height - 100,'help_button_spritesheet', helpClick, this, 2, 1, 0); //2, 1, 0 are frames of spritesheet
            helpButton.onInputOver.add(overHelp, this); //when button is hovered over
            helpButton.onInputOut.add(outHelp, this); //when button is not hovered over over
            helpButton.onInputUp.add(upHelp, this); //when finished clicking

            //var myId = "unique ID1";//server assigns this
            this.player1 = new Player(this, myId, 1);
            this.player2 = new Player(this, myId, 2);

//Mob Physics & creation
            mobs = game.add.group();
            mobs.enableBody = true;
            createmobs();

//Keybindings
            //  Cursor keys to fly + space to fire
            this.cursors = this.input.keyboard.createCursorKeys();

            this.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

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
			
	    powerButton1 = game.add.button(765,255,"power1button",power1upgrade,this,0);
	    powerButton1.visible =! powerButton1.visible;
			
	    powerButton2 = game.add.button(774,330,"power2button",power2upgrade,this,0);
	    powerButton2.visible =! powerButton2.visible;
			
	    powerButton3 = game.add.button(770,410,"power3button",power3upgrade,this,0);
	    powerButton3.visible =! powerButton3.visible;
			
	    powerButton4 = game.add.button(775,490,"power4button",power4upgrade,this,0);
	    powerButton4.visible =! powerButton4.visible;
			
	    powerButton5 = game.add.button(770,565,"power5button",power5upgrade,this,0);
	    powerButton5.visible =! powerButton5.visible;
            
	    //gun upgrade buttons
			
	    gunspeedButton1 = game.add.button(920,255,"speed1button",speed1upgrade,this,0);
	    gunspeedButton1.visible =! gunspeedButton1.visible;
			
	    gunspeedButton2 = game.add.button(915,333,"speed2button",speed2upgrade,this,0);
	    gunspeedButton2.visible =! gunspeedButton2.visible;
			
	    gunspeedButton3 = game.add.button(922,405,"speed3button",speed3upgrade,this,0);
	    gunspeedButton3.visible =! gunspeedButton3.visible;
			
	    gunspeedButton4 = game.add.button(922,490,"speed4button",speed4upgrade,this,0);
	    gunspeedButton4.visible =! gunspeedButton4.visible;
			
	    gunspeedButton5 = game.add.button(922,565,"speed5button",speed5upgrade,this,0);
	    gunspeedButton5.visible =! gunspeedButton5.visible;
			
			
	    gunpowerButton1 = game.add.button(1030,255,"power1button",gunpower1upgrade,this,0);
	    gunpowerButton1.visible =! gunpowerButton1.visible;
			
	    gunpowerButton2 = game.add.button(1036,333,"power2button",gunpower2upgrade,this,0);
	    gunpowerButton2.visible =! gunpowerButton2.visible;
			
	    gunpowerButton3 = game.add.button(1030,405,"power3button",gunpower3upgrade,this,0);
	    gunpowerButton3.visible =! gunpowerButton3.visible;
			
	    gunpowerButton4 = game.add.button(1035,490,"power4button",gunpower4upgrade,this,0);
	    gunpowerButton4.visible =! gunpowerButton4.visible;
			
	    gunpowerButton5 = game.add.button(1030,565,"power5button",gunpower5upgrade,this,0);
	    gunpowerButton5.visible =! gunpowerButton5.visible;
			
			
	    //wall upgrade buttons
            
            
            
            
            
            option_menu = game.add.image(game.world.centerX- 400, game.world.centerY- 400, 'option_menu');
            option_menu.visible =! option_menu.visible;
            
            help_menu = game.add.image(game.world.centerX- 400, game.world.centerY- 400, 'help_menu');
            help_menu.visible =! help_menu.visible;
            

            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            var style2 = { font: "bold 16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            wallHealth = this.add.text(220,35, "Wall Health: " + wall.health, style);
            mapstate  = game.add.text(1680,20,map,style2);
            roundstate = game.add.text(1700,42,round,style2);
            scorestate = game.add.text(1500,25,score,style);
            goldstate = game.add.text(1400,850,gold,style);
            
            // Ending and Looping
            
            stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
            stateText.anchor.setTo(0.5, 0.5);
            stateText.visible = false;

        },

////////////////////////////////////////////////////////////////////
//  Wall Damage handler
////////////////////////////////////////////////////////////////////        
        wallDamage: function (doDamage)
        {
            //Mob/Wall Interaction Handling
            for(var i = 0; i < mobs.length; i++)
            {
                if(mobs.getAt(i).body.x <= 500)
                {
                    mobs.getAt(i).body.velocity.set(0);
                    if(doDamage)
                    {
                        mobs.getAt(i).frame = 1; //for some reason this framing wont work....
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
            
                                game.input.onTap.addOnce(restartiflost,this);
                            }
                            
                            else if(lostcount === 3)
                            {
                                stateText.text = "Game Over";
                                stateText.visible = true;
                                
                                game.input.onTap.addOnce(gameover,this);
                            }
                            
                        }
                    }
                }
                else{
                    mobs.getAt(i).frame = 0;
                }
            }
        },
////////////////////////////////////////////////////////////////////
//  Gamestate Update Function
///////////////////////////////////////////////////////////////////

        update: function () {
        this.player1.update();
        this.player2.update();
        
        if(this.game.input.keyboard.isDown(Phaser.Keyboard.J)){
             eurecaServer.helloWorld(playerId, myId);
        }
        
        
//Mob/Projectile Interaction Handling            
            //for all bullets call this
            this.physics.arcade.overlap(this.player1.rifleBullets,mobs,collidehandler,null,this); 
            this.physics.arcade.overlap(this.player2.rifleBullets,mobs,collidehandler,null,this); 
            this.physics.arcade.overlap(this.player1.mBullets,mobs,collidehandler,null,this); 
            this.physics.arcade.overlap(this.player2.mBullets,mobs,collidehandler,null,this); 
            this.physics.arcade.overlap(this.player1.rBullets,mobs,collidehandler,null,this); 
            this.physics.arcade.overlap(this.player2.rBullets,mobs,collidehandler,null,this);

//turret handling            
            if(this.game.input.keyboard.isDown(Phaser.Keyboard.FOUR) && tindex < 8){
                if(!flipFlop){
                    var newturret = new Turret(this, tindex);
                    turrets.push(newturret);
                    tindex = turrets.length;
                    flipFlop = true;
                }
            }
            if(!this.game.input.keyboard.isDown(Phaser.Keyboard.FOUR)){
                flipFlop = false;
            }
            
            for(var i = 0; i < turrets.length; i++){
                turrets[i].update();
                this.physics.arcade.overlap(turrets[i].tBullets,mobs,collidehandler,null,this);
            }
            
            
            if(wallFrequency === 120)
            {
                this.wallDamage(true);
                wallFrequency = 0;
            }
            else
            {
                this.wallDamage(false);
                wallFrequency++;
            }
            
           
            //GUI Updates
            wallHealth.setText("Wall Health: " + wall.health);
            roundstate.setText(round);
            mapstate.setText(map);
            scorestate.setText(score);
            goldstate.setText(this.player1.gold);
          
        
    }
        

    };

	
	eurecaClientSetup();
    //game.state.add('game', PhaserGame, true);
    
////////////////////////////////////////////////////////////////////
//  Mobs/Projectiles Collision Handler
////////////////////////////////////////////////////////////////////    
    function collidehandler(projectile , mobs)
    {
        
        projectile.kill();
        mobs.health -= projectile.damage;
		
		PhaserGame.player1.gold += 1;
		PhaserGame.player2.gold += 1;
		
        if (mobs.health <= 0)
        {
            mobs.destroy();
            score = score + 1;
            deadmobs ++;
            
            if(deadmobs === mobnumber )
            {
                if(round <= 10 )
                {
                    stateText.text = " You Won, \n Click to Continue on the the next round";
                    stateText.visible = true;
                }
                
                game.input.onTap.addOnce(restart,this);
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
         
       for( var i = 0; i < mobnumber; i ++)
        {
            var mob =  mobs.create(1950 - Math.random()*(100-50) , Math.random()*(700-100)+100,'mob_sprite');
            mob.body.velocity.x = -100;
            mob.body.gravity.y = 0;
            mob.health = 250;
            
            if (round === 10)
            {
                var boss = mobs.create(1700,400,'boss_sprite');
                //boss.body.velocity.x = 100;
                boss.body.gravity.y = 0;
                boss.health = 5000;
                
            }
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
	if(gold < goldneeded)
	{
		//
	}
	else
	{
		turretdamage = turretdamage + 5;
		PhaserGame.player1.gold -= 5;
		PhaserGame.player2.gold -= 5;
	}
	//turretdamage = turretdamage + 5;
	
    
    }
    
    function power2upgrade()
    {
	var goldneeded = 10;
	if(gold < goldneeded)
	{
		//
	}
	else
	{
		turretdamage = turretdamage + 10;
		PhaserGame.player1.gold -= 10;
		PhaserGame.player2.gold -= 10;
	}
    	
    }
    function power3upgrade()
    {
	var goldneeded = 15;
	if(gold < goldneeded)
	{
		//
	}
	else
	{
		turretdamage = turretdamage + 15;
		PhaserGame.player1.gold -= 15;
		PhaserGame.player2.gold -= 15;
	}
    	
    }
    
    function power4upgrade()
    {
	var goldneeded = 20;
	if(gold < goldneeded)
	{
		//
	}
	else
	{
		turretdamage = turretdamage + 20;
		PhaserGame.player1.gold -= 20;
		PhaserGame.player2.gold -= 20;
	}
    	
    }
	function power5upgrade()
	{
		var goldneeded = 50;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			turretdamage = turretdamage + 50;
			PhaserGame.player1.gold -= 50;
			PhaserGame.player2.gold -= 50;
		}
		
	}
	
	
	//gun upgrades
	
	function gunpower1upgrade()
	{
		var goldneeded = 5;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletdamagevar += 5;
			PhaserGame.player2.bulletdamagevar += 5;
			PhaserGame.player1.gold -= 5;
			PhaserGame.player2.gold -= 5;
		}
		//turretdamage = turretdamage + 5;
		
	}
	function gunpower2upgrade()
	{
		var goldneeded = 10;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletdamagevar += 10;
			PhaserGame.player2.bulletdamagevar += 10;
			PhaserGame.player1.gold -= 10;
			PhaserGame.player2.gold -= 10;
		}
		
	}
	function gunpower3upgrade()
	{
		var goldneeded = 15;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletdamagevar += 15;
			PhaserGame.player2.bulletdamagevar += 15;
			PhaserGame.player1.gold -= 15;
			PhaserGame.player2.gold -= 15;
		}
		
	}
	function gunpower4upgrade()
	{
		var goldneeded = 20;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletdamagevar += 20;
			PhaserGame.player2.bulletdamagevar += 20;
			PhaserGame.player1.gold -= 20;
			PhaserGame.player2.gold -= 20;
		}
		
	}
	function gunpower5upgrade()
	{
		var goldneeded = 50;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletdamagevar += 50;
			PhaserGame.player2.bulletdamagevar += 50;
			PhaserGame.player1.gold -= 50;
			PhaserGame.player2.gold -= 50;
		}
		
	}
	
	function speed1upgrade()
	{
		var goldneeded = 5;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletspeed += 5;
			PhaserGame.player2.bulletspeed += 5;
			PhaserGame.player1.gold -= 5;
			PhaserGame.player2.gold -= 5;
		}
	}
	
	function speed2upgrade()
	{
		var goldneeded = 10;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletspeed += 10;
			PhaserGame.player2.bulletspeed += 10;
			PhaserGame.player1.gold -= 10;
			PhaserGame.player2.gold -= 10;
		}
	}
	
	function speed3upgrade()
	{
		var goldneeded = 15;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletspeed += 15;
			PhaserGame.player2.bulletspeed += 15;
			PhaserGame.player1.gold -= 15;
			PhaserGame.player2.gold -= 15;
		}
	}
	
	function speed4upgrade()
	{
		var goldneeded = 20;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletspeed += 20;
			PhaserGame.player2.bulletspeed += 20;
			PhaserGame.player1.gold -= 20;
			PhaserGame.player2.gold -= 20;
		}
	}
	
	function speed5upgrade()
	{
		var goldneeded = 50;
		if(gold < goldneeded)
		{
			//
		}
		else
		{
			PhaserGame.player1.bulletspeed += 50;
			PhaserGame.player2.bulletspeed += 50;
			PhaserGame.player1.gold -= 50;
			PhaserGame.player2.gold -= 50;
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
        option_menu.visible =! option_menu.visible;
    }
    function overOption(){
    }
    function outOption(){
    }
    function upOption(){
       console.log('button up', arguments);
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
