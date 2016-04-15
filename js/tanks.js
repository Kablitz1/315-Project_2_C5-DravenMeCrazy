//EDITING


////////////////////////////////////////////////////////////////////
//  Global Variable Declerations
////////////////////////////////////////////////////////////////////
    var game = new Phaser.Game(1920, 900, Phaser.AUTO, 'game');
    //var Eureca = require('eureca.io');
    
    var myId = 0;
    var playerId = 2;
	var playerList = [];
    

    //players
    var localPlayer;
    var partner;

    //projectiles
    var bulletdamage = 0;
    
    //turrets
    var turrets;
    
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

////////////////////////////////////////////////////////////////////
//  eurecaClient Setup
////////////////////////////////////////////////////////////////////
var ready = false;
var eurecaServer;

//handles client communication with server
var eurecaClientSetup = function(){
    //create eureca.io client instance
    var eurecaClient = new Eureca.Client();
    
    
    //?
    eurecaClient.ready(function (proxy){
        eurecaServer = proxy;
    });
    
    //methods under "exports" become available on server side (aka heres the functions the server can call)
    //var myId = "TEMP ID"; //TODO:: TAKE THIS OUT WHEN SERVER ASSIGNS A RANDOM ONE
    eurecaClient.exports.setId = function(id, playerIndex){
        myId = id; //unique connection ID
        playerId = playerIndex; //ADD PLAYER INDEX AS ARGUMENT LATER
		console.log(playerId);
		game.state.add('game', PhaserGame, true);
        //PhaserGame.create(); //create method of game, need to define for this instance
        eurecaServer.handshake();
        ready = true; //start handshaking
    }    
    
//basically any functions that server needs to call will be defined here    
    //eurecaClient.exports.updateState = function(id, state){
        
    //}
	
	eurecaClient.exports.spawnEnemy = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		console.log('SPAWN');
		//var partner = new Player(game, i, playerId);
		if(playerId === 1)
			partner = new Player(game, i, 2);
		
		if(playerId === 2)
			partner = new Player(game, i, 1);
		
		if(playerId > 2)
			return;
		
		playerList[i] = partner;
	}
	
	eurecaClient.exports.helloWorld = function(){
		console.log("HELLO WORLD" + myId);
	}
    
    //eurecaClient.exports.startNextRound = function(startBool){
        
    //}
    
}

//var game = new Phaser.Game(1920, 900, Phaser.AUTO, 'game', { create: eurecaClientSetup });

////////////////////////////////////////////////////////////////////
//  Main Player Class
////////////////////////////////////////////////////////////////////
var Player = function(game, player, index, bullet){
    
    this.game = game;
    this.player = player;
	//this.index = index;

    //player sprite
    
	console.log('INDEX: %s', index);
    if(index === 1){ //player 1
        this.alien = game.add.sprite(27,game.world.height-500, 'alien_sprite');
    }
    else if(index === 2){ //player 2
        this.alien = game.add.sprite(125,game.world.height-500, 'alien_sprite');
    }
	else{
		return;
	}
	
    this.alien.enableBody = true;
    this.game.physics.arcade.enable(this.alien); 
    this.alien.frame = 0; //rifle default animation
    this.alien.body.gravity.y = 0;
    this.alien.body.collideWorldBounds = true;

    //making rifle bullets
    this.rifleBullets  = [];
};
    var nextShotAt = 0;
    var shotDelay = 500;
Player.prototype.fireRifle = function(){
    
    if(nextShotAt > this.game.time.now){
        return;
    }
    
    nextShotAt = this.game.time.now + shotDelay;
    
     if(this.rifleBullets.length < 64){

            var bullet = this.game.add.sprite(this.alien.x + 50, this.alien.y + 53, 'rifle_projectile');
            this.game.physics.enable(bullet, Phaser.Physics.ARCADE);
            bullet.body.velocity.x = 200;
            this.rifleBullets.push(bullet);
            
    }
}

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
    
    /*if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        this.fireRifle();
    }*/
    
    
    
    
}

////////////////////////////////////////////////////////////////////
//  Main Game Loop
////////////////////////////////////////////////////////////////////
    var PhaserGame = function () {

        //this.background = null;

        this.localPlayer = null;
        this.partner = null;
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
            this.localPlayer = new Player(this, myId, playerId);
            //this.partner = new Player(this, myId, 2);

//Mob Physics & creation
            mobs = game.add.group();
            mobs.enableBody = true;
            createmobs();
            
//Turret group creation
            turrets = game.add.group();
            turrets.inputEnabled = true;
            //turrets.create(27,game.world.height-500,'turret_sprite');

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
			
			//eurecaClient.exports.helloWorld();
        this.localPlayer.update();
		if(this.partner != null)
			this.partner.update();
//Mob/Projectile Interaction Handling            
            var statement = this.physics.arcade.overlap(this.weapons[this.currentWeapon],mobs,collidehandler,null,this);
            //console.log(statement); //tells you how many collisions in the console
            
            
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
            
            
            
//Turret Placement & Firing
           /* hotKey4.onDown.add(turretPlace, this);
            for(var i = 0; i < turrets.length; i++){
                this.weapons[this.currentWeapon].fire(this.turrets.getAt(i));
            }*/
           /*
            if (this.input.keyboard.isDown(Phaser.Keyboard.X)){
                this.weapons[this.currentWeapon].fire(this.partner.alien);
            } */
           
             //GUI Updates
             wallHealth.setText("Wall Health: " + wall.health);
             roundstate.setText(round);
             mapstate.setText(map);
             scorestate.setText(score);
             var p1Fire = this.input.keyboard.isDown(Phaser.Keyboard.X);
             var p2Fire = this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR);
             
             if(p1Fire){

                 this.partner.fireRifle();
            }
             if(p2Fire){
                this.localPlayer.fireRifle();

            }
            
        }
        


    };

	eurecaClientSetup();
	
    //game.state.add('game', PhaserGame, true);
    
////////////////////////////////////////////////////////////////////
//  Mobs/Projectiles Collision Handler
////////////////////////////////////////////////////////////////////    
    function collidehandler(projectile , mobs)
    {
        
        //text1.visible =! text1.visible;
        projectile.kill();
        mobs.health -= bulletdamage;
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
//  Turret Placement Handling
////////////////////////////////////////////////////////////////////  
    function turretPlace(){
        /*//create turret, add to group
        if(turrets.length < 8){//limit turret number
            var turret = turrets.create(220, (turrets.length+1)*87, 'turret_sprite');
            //now we need to get the turrets to auto fire
        }*/

    }
    
////////////////////////////////////////////////////////////////////
//  Button Interfaces
////////////////////////////////////////////////////////////////////
    function upgradeClick(){
        //on click pull up Upgrade Menu
        upgrade_menu.visible =! upgrade_menu.visible;
        //now start displaying upgrade menu
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